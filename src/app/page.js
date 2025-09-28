'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import db from '../lib/db';

export default function Home() {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThoughts();
  }, []);

  const loadThoughts = async () => {
    try {
      const allThoughts = await db.thoughts.orderBy('updatedAt').reverse().toArray();
      setThoughts(allThoughts);
    } catch (error) {
      console.error('Error loading thoughts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="container">
        <h1>Distancing from Thoughts</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>Distancing from Thoughts</h1>
        <p>A mental wellbeing app to help you create distance from persistent negative thoughts</p>
      </header>

      <section>
        <Link href="/form/new">
          <button type="button" className="primary">Add New Thought</button>
        </Link>
      </section>

      <section>
        <h2>Your Thoughts</h2>
        {thoughts.length === 0 ? (
          <p>No thoughts recorded yet. Click "Add New Thought" to get started.</p>
        ) : (
          <div className="thoughts-list">
            {thoughts.map((thought) => (
              <div key={thought.id} className="card">
                <div className="card-header">
                  <h3>
                    <Link href={thought.isDraft ? `/form/${thought.id}` : `/view/${thought.id}`}>
                      {thought.thought || 'Untitled Thought'}
                    </Link>
                  </h3>
                  <div className="card-meta">
                    <span className="date">{formatDate(thought.updatedAt)}</span>
                    {thought.isDraft && (
                      <span className="draft-indicator">DRAFT</span>
                    )}
                  </div>
                </div>
                {thought.situation && (
                  <p className="card-preview">{thought.situation.substring(0, 100)}...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
