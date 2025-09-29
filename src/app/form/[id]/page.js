'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import db from '../../../lib/db';

export default function FormPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    situation: '',
    thought: '',
    distressLevel: 0,
    emotions: [],
    otherEmotion: '',
    isDraft: true
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const emotionOptions = [
    'Anger', 'Frustration', 'Upset', 'Sadness', 'Hurt', 'Rage', 'Envy',
    'Jealousy', 'Resentment', 'Fear', 'Worry', 'Shame', 'Guilt', 'Hopelessness'
  ];

  useEffect(() => {
    if (!isNew) {
      loadFormData();
    }
  }, [id, isNew]);

  useEffect(() => {
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (formData.situation || formData.thought) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const loadFormData = async () => {
    try {
      const thought = await db.thoughts.get(parseInt(id));
      if (thought) {
        setFormData({
          situation: thought.situation || '',
          thought: thought.thought || '',
          distressLevel: thought.distressLevel || 0,
          emotions: thought.emotions || [],
          otherEmotion: thought.otherEmotion || '',
          isDraft: thought.isDraft || false
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!formData.situation && !formData.thought) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const dataToSave = {
        ...formData,
        updatedAt: now,
        isDraft: true
      };

      if (isNew) {
        dataToSave.createdAt = now;
        const newId = await db.thoughts.add(dataToSave);
        router.replace(`/form/${newId}`);
      } else {
        await db.thoughts.update(parseInt(id), dataToSave);
      }

      setLastSaved(now);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const now = new Date().toISOString();
      const dataToSave = {
        ...formData,
        updatedAt: now,
        isDraft: false
      };

      if (isNew) {
        dataToSave.createdAt = now;
        const newId = await db.thoughts.add(dataToSave);
        router.push(`/view/${newId}`);
      } else {
        await db.thoughts.update(parseInt(id), dataToSave);
        router.push(`/view/${id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmotionChange = (emotion, checked) => {
    setFormData(prev => ({
      ...prev,
      emotions: checked
        ? [...prev.emotions, emotion]
        : prev.emotions.filter(e => e !== emotion)
    }));
  };

  const formatLastSaved = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Distance from Thoughts</h1>
        <div>
          {lastSaved && (
            <span>
              DRAFT SAVED {formatLastSaved(lastSaved)}
            </span>
          )}
          {saving && <span>Saving...</span>}
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <label htmlFor="situation">
          What situation prompted the thought?
        </label>
        <textarea
          id="situation"
          value={formData.situation}
          onChange={(e) => handleInputChange('situation', e.target.value)}
          placeholder="Describe the situation that led to this thought..."
          rows="4"
          style={{ resize: "none" }}
        />

        <label htmlFor="thought">
          What thought am I trying to create distance from?
        </label>
        <input
          type="text"
          id="thought"
          value={formData.thought}
          onChange={(e) => handleInputChange('thought', e.target.value)}
          placeholder="Write down the specific thought you want to distance yourself from..."
        />

        <label htmlFor="distressLevel">
          How much distress am I experiencing because of this thought right now?
        </label>
        <div className="slider-container">
          <input
            type="range"
            id="distressLevel"
            min="0"
            max="10"
            value={formData.distressLevel}
            onChange={(e) => handleInputChange('distressLevel', parseInt(e.target.value))}
          />
          <span className="slider-value">{formData.distressLevel}</span>
        </div>

        <label>What emotions do I notice when this thought comes up?</label>
        <div className="emotions-grid">
          {emotionOptions.map((emotion) => (
            <button
              key={emotion}
              type="button"
              className={`emotion-button ${formData.emotions.includes(emotion) ? 'pressed' : ''}`}
              onClick={() => handleEmotionChange(emotion, !formData.emotions.includes(emotion))}
            >
              {emotion}
            </button>
          ))}
        </div>

        <label htmlFor="otherEmotion">
          Other emotion(s):
        </label>
        <input
          type="text"
          id="otherEmotion"
          value={formData.otherEmotion}
          onChange={(e) => handleInputChange('otherEmotion', e.target.value)}
          placeholder="Describe any other emotions..."
        />

        <div>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Submit'}
          </button>
          <Link href="/">
            <button type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </main>
  );
}
