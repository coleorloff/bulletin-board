import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = 'src/data/bookmarks.json';

// Helper to get local bookmarks path
const getLocalPath = () => path.join(process.cwd(), filePath);

export async function GET() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPOSITORY;

    if (githubToken && githubRepo) {
      const urlApi = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`;
      const getFileRes = await fetch(urlApi, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NextJS-Curation-Dashboard'
        },
        next: { revalidate: 0 }
      });

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        return NextResponse.json(JSON.parse(decodedContent));
      }
    }

    // Local file fallback
    const localFilePath = getLocalPath();
    if (fs.existsSync(localFilePath)) {
      const fileContent = fs.readFileSync(localFilePath, 'utf8');
      return NextResponse.json(JSON.parse(fileContent));
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve bookmarks', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedBookmarks = await request.json();
    if (!Array.isArray(updatedBookmarks)) {
      return NextResponse.json({ error: 'Invalid payload: expected an array' }, { status: 400 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPOSITORY;

    if (githubToken && githubRepo) {
      const urlApi = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`;
      
      // Get the current sha
      const getFileRes = await fetch(urlApi, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NextJS-Curation-Dashboard'
        },
        next: { revalidate: 0 }
      });

      let fileSha = '';
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        fileSha = fileData.sha;
      }

      // Update contents
      const updateFileRes = await fetch(urlApi, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-Curation-Dashboard'
        },
        body: JSON.stringify({
          message: 'curate: manual bookmarks curation update',
          content: Buffer.from(JSON.stringify(updatedBookmarks, null, 2)).toString('base64'),
          sha: fileSha
        })
      });

      if (!updateFileRes.ok) {
        const errText = await updateFileRes.text();
        throw new Error(`GitHub update failed: ${errText}`);
      }

      return NextResponse.json({ success: true, message: 'Saved to GitHub' });
    } else {
      // Local write
      const localFilePath = getLocalPath();
      fs.writeFileSync(localFilePath, JSON.stringify(updatedBookmarks, null, 2), 'utf8');
      return NextResponse.json({ success: true, message: 'Saved locally' });
    }
  } catch (error: any) {
    console.error('Curation save error:', error);
    return NextResponse.json({ error: 'Failed to update bookmarks', details: error.message }, { status: 500 });
  }
}
