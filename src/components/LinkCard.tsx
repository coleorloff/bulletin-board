'use client';

import React, { useState } from 'react';

interface LinkCardProps {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  image?: string | null;
  tags?: string[];
  comment?: string;
}

export default function LinkCard({
  id,
  url,
  title,
  description,
  category,
  image,
  tags,
  comment
}: LinkCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Get accent class name based on category
  const getCategoryAccentClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'design':
        return 'accent-blue';
      case 'development':
      case 'dev':
        return 'accent-coral';
      case 'tip-off':
        return 'accent-lime';
      case 'culture':
      default:
        return 'accent-purple';
    }
  };

  const accentClass = getCategoryAccentClass(category);

  return (
    <div className={`link-card ${accentClass}`}>
      <div className="card-media-wrapper">
        {image ? (
          <img src={image} alt={title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-fallback-media">
            <span className="fallback-symbol">🔗</span>
          </div>
        )}
        <span className={`category-tag ${accentClass}`}>{category.toUpperCase()}</span>
      </div>

      <div className="card-body">
        <a href={url} target="_blank" rel="noopener noreferrer" className="card-title-link">
          <h3 className="card-title">
            {title}
            <span className="arrow-icon">↗</span>
          </h3>
        </a>

        {comment && (
          <div className="card-comment">
            <p className="comment-text">“{comment}”</p>
          </div>
        )}

        <p className="card-description">{description}</p>

        {tags && tags.length > 0 && (
          <div className="card-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div className="action-buttons">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn link-btn"
              aria-label="Open link directly"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            
            <button
              onClick={handleCopyLink}
              className={`action-btn copy-btn ${isCopied ? 'active' : ''}`}
              aria-label="Copy link"
            >
              {isCopied ? (
                <span className="copy-success-tooltip">Copied!</span>
              ) : null}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <span className="card-date-label">Week Log</span>
        </div>
      </div>
    </div>
  );
}
