'use client';

import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Filter from '../components/Filter';
import Board from '../components/Board';
import LinkCard from '../components/LinkCard';
import ChromeTip from '../components/ChromeTip';
import initialBookmarks from '../data/bookmarks.json';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Sort bookmarks by timestamp descending
  const sortedBookmarks = useMemo(() => {
    return [...initialBookmarks].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, []);

  // Compute available weeks dynamically and sort descending
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<string>();
    sortedBookmarks.forEach((b) => {
      if (b.week) weeksSet.add(b.week);
    });
    return Array.from(weeksSet).sort((a, b) => b.localeCompare(a));
  }, [sortedBookmarks]);

  // Set the default week to the latest week available
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    return availableWeeks[0] || '';
  });

  // Extract unique categories for the filter (plus 'all')
  const categories = useMemo(() => {
    const catsSet = new Set<string>();
    sortedBookmarks.forEach((b) => {
      if (b.category) catsSet.add(b.category);
    });
    return ['all', ...Array.from(catsSet)];
  }, [sortedBookmarks]);

  // Filter bookmarks by both week and category
  const filteredBookmarks = useMemo(() => {
    return sortedBookmarks.filter((b) => {
      const matchesWeek = b.week === selectedWeek;
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

