'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
  week: string;
  image?: string | null;
  fallbackStyle?: string | null;
  tags?: string[];
  comment?: string;
  visible?: boolean;
}

export default function CuratePage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Bookmark form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    url: '',
    title: '',
    description: '',
    category: 'design',
    comment: '',
    tagsString: ''
  });

  // Fetch all bookmarks from API on mount
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const data = await res.json();
          // Ensure all bookmarks have a default 'visible' property
          const normalized = data.map((b: any) => ({
            ...b,
            visible: b.visible !== false // default to true if undefined
          }));
          setBookmarks(normalized);
        }
      } catch (err) {
        showToast('Failed to load bookmarks.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle visible status of a bookmark
  const handleToggleVisible = (id: string) => {
    setBookmarks(prev =>
      prev.map(b => (b.id === id ? { ...b, visible: !b.visible } : b))
    );
  };

  // Handle value change for a bookmark text input/textarea
  const handleFieldChange = (id: string, field: keyof Bookmark, value: any) => {
    setBookmarks(prev =>
      prev.map(b => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Handle tag updates (convert comma-separated string back to array)
  const handleTagsChange = (id: string, value: string) => {
    const tagsArray = value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    handleFieldChange(id, 'tags', tagsArray);
  };

  // Delete bookmark
  const handleDeleteBookmark = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast('Bookmark removed from staging.', 'success');
    }
  };

  // Helper function to get ISO Week (e.g. 2026-W24)
  const getWeekString = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  // Handle adding new bookmark manually
  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmark.url || !newBookmark.title) {
      showToast('URL and Title are required.', 'error');
      return;
    }

    const timestamp = new Date().toISOString();
    const week = getWeekString(new Date());
    const tags = newBookmark.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const added: Bookmark = {
      id: Math.random().toString(36).substring(2, 11),
      url: newBookmark.url,
      title: newBookmark.title,
      description: newBookmark.description || 'No description provided.',
      category: newBookmark.category,
      timestamp,
      week,
      tags,
      comment: newBookmark.comment,
      visible: true,
      image: null
    };

    setBookmarks(prev => [added, ...prev]);
    setNewBookmark({
      url: '',
      title: '',
      description: '',
      category: 'design',
      comment: '',
      tagsString: ''
    });
    setShowAddForm(false);
    showToast('Bookmark added at top of staging.', 'success');
  };

  // Save changes via API
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarks)
      });
      if (res.ok) {
        showToast('All changes successfully saved!', 'success');
      } else {
        throw new Error('Failed to save bookmarks');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="curate-loading">
        <div className="spinner"></div>
        <p>Loading staging registry...</p>
      </div>
    );
  }

  return (
    <div className="curate-container">
      {toast && (
        <div className={`curate-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <header className="curate-header">
        <div className="curate-header-brand">
          <Link href="/" className="curate-back-link">
            ← BACK TO LOG
          </Link>
          <h2 className="curate-title">Curation Panel</h2>
          <p className="curate-subtitle">
            Configure, edit details, toggle visibility on site, or add items to the weekly log.
          </p>
        </div>

        <div className="curate-actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="curate-add-btn"
          >
            {showAddForm ? 'Close Add Form' : '+ Add Bookmark'}
          </button>
          
          <button 
            onClick={handleSaveChanges} 
            disabled={saving} 
            className="curate-save-btn"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {showAddForm && (
        <form onSubmit={handleAddBookmark} className="curate-add-form">
          <h3 className="form-heading">Create Bookmark</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Link URL *</label>
              <input 
                type="url" 
                placeholder="https://example.com" 
                required 
                value={newBookmark.url}
                onChange={e => setNewBookmark({...newBookmark, url: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                placeholder="Site Title" 
                required 
                value={newBookmark.title}
                onChange={e => setNewBookmark({...newBookmark, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                value={newBookmark.category}
                onChange={e => setNewBookmark({...newBookmark, category: e.target.value})}
              >
                <option value="design">DESIGN</option>
                <option value="development">DEVELOPMENT</option>
                <option value="tip-off">TIP-OFF</option>
                <option value="culture">CULTURE</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input 
                type="text" 
                placeholder="inspiration, vectors, nextjs" 
                value={newBookmark.tagsString}
                onChange={e => setNewBookmark({...newBookmark, tagsString: e.target.value})}
              />
            </div>

            <div className="form-group span-2">
              <label>Personal Quote / Comment</label>
              <input 
                type="text" 
                placeholder="Why is this resource cool?" 
                value={newBookmark.comment}
                onChange={e => setNewBookmark({...newBookmark, comment: e.target.value})}
              />
            </div>

            <div className="form-group span-2">
              <label>Detailed Description</label>
              <textarea 
                rows={3}
                placeholder="Concise breakdown of what it is..." 
                value={newBookmark.description}
                onChange={e => setNewBookmark({...newBookmark, description: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="form-submit-btn">Insert to Staging</button>
        </form>
      )}

      <div className="curate-list">
        {bookmarks.length === 0 ? (
          <div className="curate-empty">No bookmarks loaded in directory.</div>
        ) : (
          bookmarks.map((b) => (
            <div key={b.id} className={`curate-item-row ${b.visible ? 'active' : 'hidden'}`}>
              <div className="item-meta-column">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={b.visible}
                    onChange={() => handleToggleVisible(b.id)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="visibility-label">
                  {b.visible ? 'VISIBLE' : 'HIDDEN'}
                </span>
                <div className="item-week-badge">{b.week}</div>
              </div>

              <div className="item-fields-column">
                <div className="fields-row-1">
                  <input 
                    type="text" 
                    className="item-title-input" 
                    value={b.title}
                    onChange={e => handleFieldChange(b.id, 'title', e.target.value)}
                  />
                  <select 
                    className="item-category-select"
                    value={b.category}
                    onChange={e => handleFieldChange(b.id, 'category', e.target.value)}
                  >
                    <option value="design">DESIGN</option>
                    <option value="development">DEVELOPMENT</option>
                    <option value="tip-off">TIP-OFF</option>
                    <option value="culture">CULTURE</option>
                  </select>
                </div>

                <div className="fields-row-2">
                  <div className="text-field-group">
                    <span className="field-hint">QUOTE / COMMENT:</span>
                    <input 
                      type="text" 
                      className="item-comment-input" 
                      value={b.comment || ''}
                      onChange={e => handleFieldChange(b.id, 'comment', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fields-row-3">
                  <div className="text-field-group">
                    <span className="field-hint">DESCRIPTION:</span>
                    <textarea 
                      className="item-desc-input" 
                      rows={2}
                      value={b.description}
                      onChange={e => handleFieldChange(b.id, 'description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fields-row-4">
                  <div className="text-field-group inline">
                    <span className="field-hint">TAGS (comma-separated):</span>
                    <input 
                      type="text" 
                      className="item-tags-input" 
                      value={(b.tags || []).join(', ')}
                      onChange={e => handleTagsChange(b.id, e.target.value)}
                    />
                  </div>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="item-source-link">
                    Open Source ↗
                  </a>
                </div>
              </div>

              <div className="item-actions-column">
                <button 
                  onClick={() => handleDeleteBookmark(b.id)} 
                  className="item-delete-btn"
                  title="Delete bookmark"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
