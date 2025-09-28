'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import db from '../../../lib/db';

export default function ViewPage({ params }) {
  const { id } = use(params);
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThought();
  }, [id]);

  const loadThought = async () => {
    try {
      const thoughtData = await db.thoughts.get(parseInt(id));
      if (thoughtData) {
        setThought(thoughtData);
      }
    } catch (error) {
      console.error('Error loading thought:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="container">
        <h1>Loading...</h1>
      </main>
    );
  }

  if (!thought) {
    return (
      <main className="container">
        <h1>Thought not found</h1>
        <Link href="/">
          <button type="button">Back to Overview</button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>Distancing from Thoughts</h1>
        <div className="view-header">
          <Link href="/">
            <button type="button">← Back to Overview</button>
          </Link>
          <span className="view-date">
            {formatDate(thought.updatedAt)}
          </span>
        </div>
      </header>

      <div className="thought-view">
        <section className="card">
          <h2>Situation</h2>
          <p>{thought.situation || 'No situation described'}</p>
        </section>

        <section className="card">
          <h2>Thought</h2>
          <p className="thought-text">"{thought.thought || 'No thought recorded'}"</p>
        </section>

        <section className="card">
          <h2>Distress Level</h2>
          <div className="distress-display">
            <div className="distress-bar">
              <div 
                className="distress-fill" 
                style={{ width: `${(thought.distressLevel / 10) * 100}%` }}
              ></div>
            </div>
            <span className="distress-value">{thought.distressLevel}/10</span>
          </div>
        </section>

        <section className="card">
          <h2>Emotions</h2>
          {thought.emotions && thought.emotions.length > 0 ? (
            <div className="emotions-list">
              {thought.emotions.map((emotion, index) => (
                <span key={index} className="emotion-tag">
                  {emotion}
                </span>
              ))}
            </div>
          ) : (
            <p>No emotions recorded</p>
          )}
          
          {thought.otherEmotion && (
            <div className="other-emotion">
              <strong>Other:</strong> {thought.otherEmotion}
            </div>
          )}
        </section>

        <div className="view-actions">
          <Link href={`/form/${id}`}>
            <button type="button">Edit</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
