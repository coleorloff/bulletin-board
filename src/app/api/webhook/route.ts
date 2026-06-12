import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to get ISO Week (e.g. 2026-W24)
function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Simple metadata scraper using regex
async function scrapeMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 0 } // disable fetch cache
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const html = await res.text();
    
    // Extract title
    let title = '';
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) title = titleMatch[1];
    
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="(.*?)"/i) ||
                         html.match(/<meta\s+name="twitter:title"\s+content="(.*?)"/i);
    if (ogTitleMatch) title = ogTitleMatch[1];

    // Extract description
    let description = '';
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i) ||
                      html.match(/<meta\s+property="og:description"\s+content="(.*?)"/i) ||
                      html.match(/<meta\s+name="twitter:description"\s+content="(.*?)"/i);
    if (descMatch) description = descMatch[1];

    // Extract image
    let image = null;
    const imgMatch = html.match(/<meta\s+property="og:image"\s+content="(.*?)"/i) ||
                     html.match(/<meta\s+name="twitter:image"\s+content="(.*?)"/i);
    if (imgMatch) image = imgMatch[1];

    // Simple tag heuristics based on keywords
    const tags: string[] = [];
    const textContent = (title + ' ' + description).toLowerCase();
    
    let category = 'culture';
    if (textContent.includes('design') || textContent.includes('ui') || textContent.includes('ux') || textContent.includes('figma') || textContent.includes('css')) {
      category = 'design';
      tags.push('design');
    } else if (textContent.includes('developer') || textContent.includes('code') || textContent.includes('github') || textContent.includes('javascript') || textContent.includes('api') || textContent.includes('python')) {
      category = 'development';
      tags.push('dev');
    } else if (textContent.includes('tip') || textContent.includes('chrome') || textContent.includes('shortcut') || textContent.includes('productivity')) {
      category = 'tip-off';
      tags.push('productivity');
    }

    return {
      title: title || 'Inspiration Link',
      description: description || 'No description available.',
      image,
      category,
      tags
    };
  } catch (error) {
    console.error('Scraping failed:', error);
    return {
      title: 'Inspiration Link',
      description: 'Scraped successfully but metadata was missing.',
      image: null,
      category: 'culture',
      tags: []
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageText = body.text || (body.message && body.message.text) || '';

    if (!messageText) {
      return NextResponse.json({ error: 'No text found in payload' }, { status: 400 });
    }

    // Extract URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = messageText.match(urlRegex);
    
    let bookmark: any;
    const now = new Date();
    const timestamp = now.toISOString();
    const week = getWeekString(now);

    if (urls && urls.length > 0) {
      const url = urls[0];
      const metadata = await scrapeMetadata(url);
      
      // Extract comment (text in message other than URL)
      const comment = messageText.replace(url, '').trim();

      bookmark = {
        id: Math.random().toString(36).substring(2, 11),
        url,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        timestamp,
        week,
        image: metadata.image,
        fallbackStyle: null,
        tags: metadata.tags,
        comment: comment || undefined
      };
    } else if (messageText.toLowerCase().includes('tip:')) {
      // Parse manual Chrome/text tip
      // Format: "Tip: Chrome omnibox search. Description here. tags: chrome, productivity"
      const contentParts = messageText.split('.');
      const title = contentParts[0].replace(/tip:/i, '').trim();
      const description = contentParts[1] ? contentParts[1].trim() : 'Chrome productivity trick.';
      
      bookmark = {
        id: Math.random().toString(36).substring(2, 11),
        url: 'chrome-tip://' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        description,
        category: 'tip-off',
        timestamp,
        week,
        image: null,
        fallbackStyle: 'chrome-ui',
        tags: ['chrome', 'productivity'],
        comment: 'Direct tip share.'
      };
    } else {
      return NextResponse.json({ error: 'No URL or Tip pattern matched' }, { status: 200 });
    }

    // Determine deployment mode (GitHub Commit vs Local write)
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPOSITORY; // format: owner/repo
    const filePath = 'src/data/bookmarks.json';

    if (githubToken && githubRepo) {
      // -- GITHUB DEPLOYED MODE (Vercel automatic push) --
      const urlApi = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`;
      
      // 1. Get current file sha and contents
      const getFileRes = await fetch(urlApi, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NextJS-Webhook-Ingester'
        }
      });

      let fileSha = '';
      let currentBookmarks: any[] = [];

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        fileSha = fileData.sha;
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        currentBookmarks = JSON.parse(decodedContent);
      }

      // 2. Append bookmark
      currentBookmarks.unshift(bookmark); // Add new bookmark to top

      // 3. Commit back to GitHub
      const updateFileRes = await fetch(urlApi, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-Webhook-Ingester'
        },
        body: JSON.stringify({
          message: `auto: ingest bookmark [${bookmark.title}]`,
          content: Buffer.from(JSON.stringify(currentBookmarks, null, 2)).toString('base64'),
          sha: fileSha
        })
      });

      if (!updateFileRes.ok) {
        const errText = await updateFileRes.text();
        throw new Error(`GitHub API update failed: ${errText}`);
      }

      return NextResponse.json({ success: true, message: 'Bookmark committed to GitHub', bookmark }, { status: 200 });
    } else {
      // -- LOCAL DEV MODE (Writes directly to project file on disk) --
      const localFilePath = path.join(process.cwd(), 'src/data/bookmarks.json');
      let currentBookmarks: any[] = [];
      
      if (fs.existsSync(localFilePath)) {
        const fileContent = fs.readFileSync(localFilePath, 'utf8');
        currentBookmarks = JSON.parse(fileContent);
      }

      currentBookmarks.unshift(bookmark);
      fs.writeFileSync(localFilePath, JSON.stringify(currentBookmarks, null, 2), 'utf8');

      return NextResponse.json({ success: true, message: 'Bookmark written to local file', bookmark }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Webhook execution error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}
