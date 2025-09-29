import Dexie from 'dexie';

// Define the database schema
const db = new Dexie('DistancingFromThoughtsDB');

db.version(1).stores({
  thoughts: '++id, situation, thought, distressLevel, emotions, otherEmotion, bodySensations, valuesInterference, beliefStrength, postDistancingValuesInterference, postDistancingBeliefStrength, whatFeelsPossible, postDistancingDistressLevel, isDraft, createdAt, updatedAt'
});

export default db;
