import { z } from 'zod';

// Schema for listing commentary with optional limit
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional()
});

// Schema for creating commentary
export const createCommentarySchema = z.object({
  minute: z.number().int().nonnegative(),
  sequence: z.number(),
  period: z.string(),
  eventType: z.string(),
  actor: z.string(),
  team: z.string(),
  message: z.string().min(1, 'Message is required'),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional()
});