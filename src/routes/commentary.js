import { Router } from 'express';
import { matchIdParamSchema } from '../validation/matches.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { commentary } from '../db/schema.js';
import { db } from '../db/db.js';
import { desc, eq } from 'drizzle-orm';

const commentaryRouter = Router();

const MAX_LIMIT = 100;

commentaryRouter.get('/', (req, res) => {
    res.send('Commentary Route');
});

commentaryRouter.get('/:id/commentary', async (req, res) => {
    // Validate match ID parameter
    const paramParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
        return res.status(400).json({ error: 'Invalid match ID.', details: paramParsed.error.issues });
    }

    // Validate query parameters
    const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
        return res.status(400).json({ error: 'Invalid query parameters.', details: queryParsed.error.issues });
    }

    const matchId = paramParsed.data.id;
    const limit = Math.min(queryParsed.data.limit ?? 50, MAX_LIMIT);

    try {
        // Fetch commentary data ordered by createdAt descending
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Error fetching commentary:', error);
        return res.status(500).json({ error: 'Failed to fetch commentary.' });
    }
});

commentaryRouter.post('/:id/commentary', async (req, res) => {
    // Validate match ID parameter
    const paramParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
        return res.status(400).json({ error: 'Invalid match ID.', details: paramParsed.error.issues });
    }

    // Validate request body
    const bodyParsed = createCommentarySchema.safeParse(req.body);
    if (!bodyParsed.success) {
        return res.status(400).json({ error: 'Invalid payload.', details: bodyParsed.error.issues });
    }

    const matchId = paramParsed.data.id;
    const commentaryData = bodyParsed.data;

    try {
        // Insert commentary data into the database
        const [newCommentary] = await db.insert(commentary).values({
            matchId: matchId,
            minute: commentaryData.minute,
            sequence: commentaryData.sequence,
            period: commentaryData.period,
            eventType: commentaryData.eventType,
            actor: commentaryData.actor,
            team: commentaryData.team,
            message: commentaryData.message,
            metadata: commentaryData.metadata,
            tags: commentaryData.tags
        }).returning();
        if(res.app.locals.broadcastCommentary){
            res.app.locals.broadcastCommentary(newCommentary.matchId,newCommentary);
        }

        return res.status(201).json({ data: newCommentary });
    } catch (error) {
        console.error('Error creating commentary:', error);
        return res.status(500).json({ error: 'Failed to create commentary.' });
    }
});

export default commentaryRouter;