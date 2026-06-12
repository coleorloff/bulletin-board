'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Filter from '../components/Filter';
import Board from '../components/Board';
import LinkCard from '../components/LinkCard';
import ChromeTip from '../components/ChromeTip';
import initialBookmarks from '../data/bookmarks.json';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<any[]>(initialBookmarks);

  // Sync with API on mount to load fresh curated edits
  useEffect(() => {
    async function syncBookmarks() {
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data);
        }
      } catch (err) {
        console.error('Failed dynamic bookmarks sync:', err);
      }
    }
    syncBookmarks();
  }, []);
  
  // Sort bookmarks by timestamp descending
  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [bookmarks]);

  // Compute available weeks dynamically and sort descending
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<string>();
    sortedBookmarks.forEach((b) => {
      // Only include weeks of bookmarks that are visible
      if (b.week && b.visible !== false) weeksSet.add(b.week);
    });
    return Array.from(weeksSet).sort((a, b) => b.localeCompare(a));
  }, [sortedBookmarks]);

  const [selectedWeek, setSelectedWeek] = useState<string>('');

  // Set default week once availableWeeks is loaded
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  // Extract unique categories for the filter (plus 'all')
  const categories = useMemo(() => {
    const catsSet = new Set<string>();
    sortedBookmarks.forEach((b) => {
      if (b.category && b.visible !== false) catsSet.add(b.category);
    });
    return ['all', ...Array.from(catsSet)];
  }, [sortedBookmarks]);

  // Filter bookmarks by visibility, week, and category
  const filteredBookmarks = useMemo(() => {
    return sortedBookmarks.filter((b) => {
      // Exclude hidden bookmarks
      if (b.visible === false) return false;

      const matchesWeek = selectedWeek === 'all' || b.week === selectedWeek;
      const matchesCategory =
        selectedCategory.toLowerCase() === 'all' ||
        b.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesWeek && matchesCategory;
    });
  }, [sortedBookmarks, selectedWeek, selectedCategory]);

  return (
    <div className="board-container">
      <Header
        activeWeek={selectedWeek}
        availableWeeks={availableWeeks}
        onWeekChange={setSelectedWeek}
        itemCount={filteredBookmarks.length}
      />
      
      <Filter
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <Board>
        {filteredBookmarks.map((bookmark) => {
          if (bookmark.fallbackStyle === 'chrome-ui') {
            return (
              <ChromeTip
                key={bookmark.id}
                title={bookmark.title}
                description={bookmark.description}
                comment={bookmark.comment}
                tags={bookmark.tags}
              />
            );
          }

          return (
            <LinkCard
              key={bookmark.id}
              id={bookmark.id}
              url={bookmark.url}
              title={bookmark.title}
              description={bookmark.description}
              category={bookmark.category}
              image={bookmark.image}
              tags={bookmark.tags}
              comment={bookmark.comment}
            />
          );
        })}
      </Board>

      {filteredBookmarks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
          fontFamily: 'var(--font-mono)'
        }}>
          NO INSPIRATION FOUND IN THIS VOLUME FOR "{selectedCategory.toUpperCase()}"
        </div>
      )}
    </div>
  );
}

