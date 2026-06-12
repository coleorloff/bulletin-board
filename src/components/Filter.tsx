import React from 'react';

interface FilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function Filter({ categories, activeCategory, onCategoryChange }: FilterProps) {
  // Category specific styling
  const getCategoryClass = (cat: string) => {
    const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
    const activeClass = isActive ? 'active' : '';
    
    switch (cat.toLowerCase()) {
      case 'all':
        return `chip-all ${activeClass}`;
      case 'design':
        return `chip-design ${activeClass}`;
      case 'development':
      case 'dev':
        return `chip-dev ${activeClass}`;
      case 'tip-off':
        return `chip-tip ${activeClass}`;
      case 'culture':
      default:
        return `chip-culture ${activeClass}`;
    }
  };

  return (
    <div className="filter-container">
      <span className="filter-label">CATEGORIES:</span>
      <div className="filter-chips-wrapper">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`filter-chip ${getCategoryClass(cat)}`}
          >
            <span className="chip-indicator"></span>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
