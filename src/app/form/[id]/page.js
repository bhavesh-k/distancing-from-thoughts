'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import db from '../../../lib/db';
import PageTitle from '../../../components/PageTitle';
import Slider from '../../../components/Slider';
import TextArea from '../../../components/TextArea';

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
    bodySensations: '',
    valuesInterference: 0,
    beliefStrength: 0,
    strategies: [],
    alternativeActions: '',
    postDistancingValuesInterference: 0,
    postDistancingBeliefStrength: 0,
    whatFeelsPossible: '',
    postDistancingDistressLevel: 0,
    isDraft: true
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [emotionOptions] = useState(() => [
    'Angry 😡', 'Frustrated 😤', 'Upset 😩', 'Sad 😢', 'Hurt 🤕', 'Envious 👀',
    'Jealous 😖', 'Annoyed 😠', 'Blasé 😒', 'Afraid 😱', 'Worried 😟', 'Embarrassed 🫣', 'Guilty 😔', 'Hopeless 😞'
  ].sort(() => Math.random() - 0.5));

  const [strategyOptions] = useState([
    'Remind myself I don\'t have to believe everything I think',
    'Remind myself that thoughts are productions of my brain',
    'Label the thought passing through me in 3rd person ("The thought that XYZ is going through Sara\'s mind")',
    'Imagine the thought passing along on a cloud in the sky',
    'Imagine the thought is being said in a funny voice or on a TV show',
    'Ask myself "Where did this thought come from?" and observe with curiosity',
    'Remind myself of other times when I had different thoughts'
  ]);

  useEffect(() => {
    if (!isNew) {
      loadFormData();
    }
  }, [id, isNew]);

  useEffect(() => {
    // Auto-save draft every X milliseconds
    const autoSaveInterval = setInterval(() => {
      if (formData.situation || formData.thought) {
        saveDraft();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [formData.situation, formData.thought]);

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
          bodySensations: thought.bodySensations || '',
          valuesInterference: thought.valuesInterference || 0,
          beliefStrength: thought.beliefStrength || 0,
          strategies: thought.strategies || [],
          alternativeActions: thought.alternativeActions || '',
          postDistancingValuesInterference: thought.postDistancingValuesInterference || 0,
          postDistancingBeliefStrength: thought.postDistancingBeliefStrength || 0,
          whatFeelsPossible: thought.whatFeelsPossible || '',
          postDistancingDistressLevel: thought.postDistancingDistressLevel || 0,
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

  const handleStrategyChange = (strategy, checked) => {
    setFormData(prev => ({
      ...prev,
      strategies: checked
        ? [...prev.strategies, strategy]
        : prev.strategies.filter(s => s !== strategy)
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
        <PageTitle>Loading...</PageTitle>
      </main>
    );
  }

  return (
    <main>
      <header>
        <PageTitle />
        <div>
          {lastSaved && (
            <span><i>
              Draft Saved {formatLastSaved(lastSaved)}
            </i></span>
          )}
          {saving && <span>Saving...</span>}
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <TextArea
          id="situation"
          label="What situation prompted the thought?"
          value={formData.situation}
          onChange={(value) => handleInputChange('situation', value)}
        />

        <label htmlFor="thought">
          What thought am I trying to create distance from?
        </label>
        <input
          type="text"
          id="thought"
          value={formData.thought}
          onChange={(e) => handleInputChange('thought', e.target.value)}
        />

        <Slider
          id="distressLevel"
          label="How much distress am I experiencing because of this thought right now?"
          value={formData.distressLevel}
          onChange={(value) => handleInputChange('distressLevel', value)}
        />

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

        <TextArea
          id="bodySensations"
          label="What sensations do I feel in my body when this thought comes up?"
          value={formData.bodySensations}
          onChange={(value) => handleInputChange('bodySensations', value)}
          placeholder="Tightness in my shoulders, clenched jaw, pain across chest, lump in my throat, pit in my stomach"
        />

        <Slider
          id="valuesInterference"
          label="How much is the thought stopping me from acting toward my values?"
          value={formData.valuesInterference}
          onChange={(value) => handleInputChange('valuesInterference', value)}
        />

        <Slider
          id="beliefStrength"
          label="How strongly do I believe the thought?"
          value={formData.beliefStrength}
          onChange={(value) => handleInputChange('beliefStrength', value)}
        />

        <label>What strategies I am willing to do <u>now</u> to create distance between me and my thoughts?</label>
        <div className="strategies-list">
          {strategyOptions.map((strategy) => (
            <button
              key={strategy}
              type="button"
              className={`strategy-button ${formData.strategies.includes(strategy) ? 'pressed' : ''}`}
              onClick={() => handleStrategyChange(strategy, !formData.strategies.includes(strategy))}
            >
              {strategy}
            </button>
          ))}
        </div>

        <TextArea
          id="alternativeActions"
          label="Imagine what I would do if I did not believe this thought?"
          value={formData.alternativeActions}
          onChange={(value) => handleInputChange('alternativeActions', value)}
        />

        <Slider
          id="postDistancingValuesInterference"
          label="After distancing from the thought, how much is this thought stopping me from acting toward my values?"
          value={formData.postDistancingValuesInterference}
          onChange={(value) => handleInputChange('postDistancingValuesInterference', value)}
        />

        <Slider
          id="postDistancingBeliefStrength"
          label="After distancing from the thought, how strongly do I believe the thought?"
          value={formData.postDistancingBeliefStrength}
          onChange={(value) => handleInputChange('postDistancingBeliefStrength', value)}
        />

        <TextArea
          id="whatFeelsPossible"
          label="What (if anything) feels more possible for me to do now?"
          value={formData.whatFeelsPossible}
          onChange={(value) => handleInputChange('whatFeelsPossible', value)}
        />

        <Slider
          id="postDistancingDistressLevel"
          label="How much distress am I experiencing because of this thought now (after practicing)?"
          value={formData.postDistancingDistressLevel}
          onChange={(value) => handleInputChange('postDistancingDistressLevel', value)}
        />

        <section>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Submit'}
          </button>
        </section>
        <br></br>
        <section><Link href="/"><em>Save and Continue Later</em></Link></section>

      </form>
    </main >
  );
}
