import React from 'react';

interface HeaderProps {
  activeWeek: string;
  availableWeeks: string[];
  onWeekChange: (week: string) => void;
  itemCount: number;
}

export default function Header({ activeWeek, availableWeeks, onWeekChange, itemCount }: HeaderProps) {
  // Format week name (e.g. 2026-W24 to "Volume 24 // Week of Jun 8, 2026")
  const formatWeekName = (weekStr: string) => {
    const [year, weekNum] = weekStr.split('-W');
    return `Vol. ${weekNum} (Year ${year})`;
  };

  return (
    <header className="board-header">
      <div className="header-brand-section">
        <div className="brand-logo">
          <span className="logo-symbol">❖</span>
          <h1 className="brand-title">Weekly Log</h1>
        </div>
        <p className="brand-subtitle">
          Inspiration, resources, and cultural tip-offs outside official work.
        </p>
      </div>

      <div className="header-meta-section">
        <div className="week-selector-container">
          <label htmlFor="week-select" className="selector-label">TIMELINE</label>
          <div className="custom-select-wrapper">
            <select
              id="week-select"
              value={activeWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="week-select-dropdown"
            >
              {availableWeeks.map((week) => (
                <option key={week} value={week}>
                  {formatWeekName(week)}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="stats-indicator">
          <span className="stats-number">{itemCount}</span>
          <span className="stats-label">Items Loaded</span>
        </div>
      </div>
    </header>
  );
}
