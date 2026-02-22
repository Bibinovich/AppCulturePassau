import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ======================================================
   ENUMS
====================================================== */

export const entityTypeEnum = pgEnum("entity_type", [
  "user",
  "community",
  "organisation",
  "venue",
  "business",
  "council",
  "government",
  "artist",
  "sponsor",
]);

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "moderator",
]);

export const membershipTierEnum = pgEnum("membership_tier", [
  "free",
  "pro",
  "vip",
]);

export const statusEnum = pgEnum("status_enum", [
  "active",
  "inactive",
  "pending",
  "completed",
  "cancelled",
]);

/* ======================================================
   USERS
====================================================== */

export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    culturePassId: varchar("culture_pass_id").unique(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),

    displayName: text("display_name"),
    email: text("email"),
    phone: text("phone"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    coverImageUrl: text("cover_image_url"),
    location: text("location"),
    city: text("city"),
    country: text("country"),
    website: text("website"),

    entityType: entityTypeEnum("entity_type").default("user"),
    role: userRoleEnum("role").default("user"),

    socialLinks: jsonb("social_links").$type<Record<string, string>>(),
    images: jsonb("images").$type<string[]>(),

    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    isVerified: boolean("is_verified").default(false),

    followersCount: integer("followers_count").default(0),
    followingCount: integer("following_count").default(0),
    likesCount: integer("likes_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    culturePassIdx: uniqueIndex("users_cpid_idx").on(table.culturePassId),
  })
);

/* ======================================================
   WALLETS (SAFE MONEY)
====================================================== */

export const wallets = pgTable(
  "wallets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),

    currency: text("currency").default("AUD"),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: uniqueIndex("wallet_user_idx").on(table.userId),
  })
);

/* ======================================================
   TRANSACTIONS
====================================================== */

export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: text("type").notNull(),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    currency: text("currency").default("AUD"),
    description: text("description"),
    status: statusEnum("status").default("completed"),

    metadata: jsonb("metadata").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("transactions_user_idx").on(table.userId),
    createdIdx: index("transactions_created_idx").on(table.createdAt),
  })
);

/* ======================================================
   FOLLOWS
====================================================== */

export const follows = pgTable(
  "follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    followerId: varchar("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    targetIdx: index("follows_target_idx").on(table.targetId),
    uniqueFollow: uniqueIndex("unique_follow").on(
      table.followerId,
      table.targetId
    ),
  })
);

/* ======================================================
   REVIEWS
====================================================== */

export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),

    rating: integer("rating")
      .notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueReview: uniqueIndex("unique_review").on(
      table.userId,
      table.targetId
    ),
  })
);

/* ======================================================
   MEMBERSHIPS
====================================================== */

export const memberships = pgTable(
  "memberships",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    tier: membershipTierEnum("tier").default("free"),

    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),

    status: statusEnum("status").default("active"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("membership_user_idx").on(table.userId),
  })
);

/* ======================================================
   TYPES
====================================================== */

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Membership = typeof memberships.$inferSelect;

/* ======================================================
   INSERT SCHEMAS
====================================================== */

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;