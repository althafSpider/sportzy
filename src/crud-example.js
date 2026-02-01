import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary, matchStatusEnum } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations for sports application...');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({ 
        sport: 'Football', 
        homeTeam: 'Manchester United', 
        awayTeam: 'Liverpool',
        status: 'scheduled',
        startTime: new Date('2024-06-15T15:00:00Z'),
        homeScore: 0,
        awayScore: 0
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }
    
    console.log('✅ CREATE: New match created:', newMatch);

    // CREATE: Insert commentary for the match
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 0,
        sequence: 1,
        period: 'First Half',
        eventType: 'start',
        message: 'The match is about to begin! Both teams take the field.',
        metadata: { whistle: true }
      })
      .returning();

    console.log('✅ CREATE: Commentary created:', newCommentary);

    // READ: Select the match
    const foundMatch = await db.select().from(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // READ: Get all commentary for the match
    const matchCommentary = await db.select().from(commentary).where(eq(commentary.matchId, newMatch.id));
    console.log('✅ READ: Found commentary items:', matchCommentary);

    // UPDATE: Update match status to live
    const [updatedMatch] = await db
      .update(matches)
      .set({ status: 'live' })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }
    
    console.log('✅ UPDATE: Match updated:', updatedMatch);

    // UPDATE: Add a goal event to commentary
    const [goalCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 23,
        sequence: 2,
        period: 'First Half',
        eventType: 'goal',
        team: 'Manchester United',
        actor: 'Marcus Rashford',
        message: 'GOAL! Marcus Rashford scores for Manchester United!',
        metadata: { assist: 'Bruno Fernandes' },
        tags: ['goal', 'manchester-united']
      })
      .returning();

    console.log('✅ UPDATE: Goal commentary added:', goalCommentary);

    // UPDATE: Update match score
    const [scoredMatch] = await db
      .update(matches)
      .set({ homeScore: 1 })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    console.log('✅ UPDATE: Match score updated:', scoredMatch);

    // DELETE: Remove the commentary
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ DELETE: Commentary deleted.');

    // DELETE: Remove the match
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Close the pool to end the connection
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();