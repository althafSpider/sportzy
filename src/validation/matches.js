import { z } from 'zod';

// Constant for match status values
const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished'
};

// Schema for listing matches with optional limit
const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional()
});

// Schema for match ID parameter
const matchIdParamSchema = z.object({
  id: z.coerce.number().positive()
});

// Schema for creating a match
const createMatchSchema = z.object({
  sport: z.string().min(1, 'Sport is required'),
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  startTime: z.string(),
  endTime: z.string(),
  homeScore: z.coerce.number().nonnegative().optional(),
  awayScore: z.coerce.number().nonnegative().optional()
}).refine((data) => {
  // Validate that startTime and endTime are valid ISO date strings
  const startValid = !isNaN(Date.parse(data.startTime));
  const endValid = !isNaN(Date.parse(data.endTime));
  return startValid && endValid;
}, {
  message: 'startTime and endTime must be valid ISO date strings',
  path: ['startTime']
}).superRefine((data, ctx) => {
  // Ensure endTime is chronologically after startTime
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endTime must be after startTime',
      path: ['endTime']
    });
  }
});

// Schema for updating match scores
const updateScoreSchema = z.object({
  homeScore: z.coerce.number().nonnegative(),
  awayScore: z.coerce.number().nonnegative()
});

export {
  MATCH_STATUS,
  listMatchesQuerySchema,
  matchIdParamSchema,
  createMatchSchema,
  updateScoreSchema
};