'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import db from '../lib/db';
import PageTitle from '../components/PageTitle';

export default function Home() {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);

  // effects
  useEffect(() => {
    loadThoughts();
  }, []);

  // functions
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
      weekday: 'long',
    });
  };

  // render
  if (loading) {
    return (
      <main>
        <PageTitle />
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <header>
        <PageTitle />
        <h3>A wellbeing practice to help you create distance from persistent thought patterns 🧠</h3>
        <p>All the data is stored locally in your browser - your thoughts stay private 😌</p>
      </header>

      <section>
        <Link href="/form/new">
          <button type="button">Add New Thought</button>
        </Link>
      </section>

      <section><header>
        {thoughts.length > 0 ? <h2>Revisit Past Thoughts</h2> : ''}
        {thoughts.map((thought) => (
          <div key={thought.id}>
            <section><aside>
              <samp>{formatDate(thought.updatedAt)}</samp>
              <p>"{thought.thought || 'Untitled Thought'}"</p>
              {thought.isDraft ? <p><i>(In progress)</i></p> : ''}
              <Link href={thought.isDraft ? `/form/${thought.id}` : `/view/${thought.id}`}><b>
                {thought.isDraft ? 'Continue' : 'View'}
              </b></Link>
            </aside></section>
          </div>
        ))}
      </header></section>
    </main >
  );
}
