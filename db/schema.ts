import { pgTable, uuid, varchar, timestamp, bigint, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    googleId: varchar('google_id', { length: 255 }).notNull().unique(),
    profilePicture: varchar('profile_picture', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Files table - stores file metadata and S3 references
export const files = pgTable('files', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    s3Key: varchar('s3_key', { length: 500 }).notNull(),
    s3Url: varchar('s3_url', { length: 1000 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    deleted: boolean('deleted').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Permission enum
export const permissionEnum = pgEnum('permission', ['read', 'edit', 'delete']);

// File shares table (with permissions)
export const fileShares = pgTable('file_shares', {
    id: uuid('id').defaultRandom().primaryKey(),
    fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
    sharedWithUserId: uuid('shared_with_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    sharedByUserId: uuid('shared_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    permission: permissionEnum('permission').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations 
export const usersRelations = relations(users, ({ many }) => ({
    ownedFiles: many(files),
    sharedFiles: many(fileShares, { relationName: 'sharedWith' }),
    sharedByMe: many(fileShares, { relationName: 'sharedBy' }),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
    owner: one(users, {
        fields: [files.ownerId],
        references: [users.id],
    }),
    shares: many(fileShares),
}));

export const fileSharesRelations = relations(fileShares, ({ one }) => ({
    file: one(files, {
        fields: [fileShares.fileId],
        references: [files.id],
    }),
    sharedWith: one(users, {
        fields: [fileShares.sharedWithUserId],
        references: [users.id],
        relationName: 'sharedWith',
    }),
    sharedBy: one(users, {
        fields: [fileShares.sharedByUserId],
        references: [users.id],
        relationName: 'sharedBy',
    }),
}));

// TypeScript types for type-safe database operations
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type FileShare = typeof fileShares.$inferSelect;
export type NewFileShare = typeof fileShares.$inferInsert;
export type Permission = 'read' | 'edit' | 'delete';

