import React from 'react';

export default function Board({ children }: { children: React.ReactNode }) {
  return (
    <main className="board-container">
      <div className="board-grid">
        {children}
      </div>
    </main>
  );
}
