import { pgTable, serial, text, timestamp, integer, pgEnum as enumType, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Match status enum
export const matchStatusEnum = enumType('match_status', ['scheduled', 'live', 'finished']);

// Matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Commentary table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull().references(() => matches.id),
  minute: integer('minute').notNull(),
  sequence: integer('sequence').notNull(),
  period: text('period').notNull(),
  eventType: text('event_type').notNull(),
  actor: text('actor'),
  team: text('team'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const matchesRelations = relations(matches, ({ many }) => ({
  commentaryEntries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));

// Export types for type-safe queries
export const Match = matches;
export const NewMatch = matches;
export const Commentary = commentary;
export const NewCommentary = commentary;
// added for type safety in queries
