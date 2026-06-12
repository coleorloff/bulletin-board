import React from 'react';

interface ChromeTipProps {
  title: string;
  description: string;
  comment?: string;
  tags?: string[];
}

export default function ChromeTip({ title, description, comment, tags }: ChromeTipProps) {
  return (
    <div className="chrome-tip-card">
      <div className="chrome-window-header">
        <div className="chrome-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="chrome-tab-title">Google Chrome</div>
      </div>
      <div className="chrome-omnibox">
        <span className="omnibox-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <div className="omnibox-input">
          <span className="omnibox-text-typed">@tabs</span>
          <span className="omnibox-cursor">|</span>
        </div>
        <span className="omnibox-shortcut">⌘ + T</span>
      </div>
      <div className="chrome-content">
        <div className="tip-header-row">
          <span className="tag-label accent-lime">CHROME TRICK</span>
        </div>
        <h3 className="tip-title">{title}</h3>
        <p className="tip-description">{description}</p>
        {comment && (
          <div className="tip-comment">
            <p className="comment-text">{comment}</p>
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="card-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
