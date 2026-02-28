var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cpidRegistry: () => cpidRegistry,
  entityTypeEnum: () => entityTypeEnum,
  eventSponsors: () => eventSponsors,
  follows: () => follows,
  insertMembershipSchema: () => insertMembershipSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentMethodSchema: () => insertPaymentMethodSchema,
  insertPerkSchema: () => insertPerkSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSponsorSchema: () => insertSponsorSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  likes: () => likes,
  membershipTierEnum: () => membershipTierEnum,
  memberships: () => memberships,
  notifications: () => notifications,
  paymentMethods: () => paymentMethods,
  perkRedemptions: () => perkRedemptions,
  perks: () => perks,
  profiles: () => profiles,
  reviews: () => reviews,
  sponsorPlacements: () => sponsorPlacements,
  sponsors: () => sponsors,
  statusEnum: () => statusEnum,
  tickets: () => tickets,
  transactions: () => transactions,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  wallets: () => wallets
});
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
  uniqueIndex
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var entityTypeEnum = pgEnum("entity_type", [
  "user",
  "community",
  "organisation",
  "venue",
  "business",
  "council",
  "government",
  "artist",
  "sponsor"
]);
var userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "moderator"
]);
var membershipTierEnum = pgEnum("membership_tier", [
  "free",
  "plus",
  "pro",
  "vip"
]);
var statusEnum = pgEnum("status_enum", [
  "active",
  "inactive",
  "pending",
  "completed",
  "cancelled"
]);
var users = pgTable(
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
    socialLinks: jsonb("social_links").$type(),
    images: jsonb("images").$type(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    isVerified: boolean("is_verified").default(false),
    followersCount: integer("followers_count").default(0),
    followingCount: integer("following_count").default(0),
    likesCount: integer("likes_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    culturePassIdx: uniqueIndex("users_cpid_idx").on(table.culturePassId)
  })
);
var wallets = pgTable(
  "wallets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),
    currency: text("currency").default("AUD"),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    userIdx: uniqueIndex("wallet_user_idx").on(table.userId)
  })
);
var transactions = pgTable(
  "transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("AUD"),
    description: text("description"),
    category: text("category"),
    status: statusEnum("status").default("completed"),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    userIdx: index("transactions_user_idx").on(table.userId),
    createdIdx: index("transactions_created_idx").on(table.createdAt)
  })
);
var follows = pgTable(
  "follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    targetIdx: index("follows_target_idx").on(table.targetId),
    uniqueFollow: uniqueIndex("unique_follow").on(
      table.followerId,
      table.targetId
    )
  })
);
var reviews = pgTable(
  "reviews",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    uniqueReview: uniqueIndex("unique_review").on(
      table.userId,
      table.targetId
    )
  })
);
var memberships = pgTable(
  "memberships",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tier: text("tier").default("free"),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    stripeCustomerId: varchar("stripe_customer_id"),
    status: text("status").default("active"),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    cashbackMultiplier: doublePrecision("cashback_multiplier").default(1),
    badgeType: varchar("badge_type").default("none"),
    billingPeriod: varchar("billing_period").default("monthly"),
    priceCents: integer("price_cents").default(0),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    userIdx: index("membership_user_idx").on(table.userId)
  })
);
var profiles = pgTable(
  "profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    entityType: entityTypeEnum("entity_type").notNull(),
    description: text("description"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    coverImageUrl: text("cover_image_url"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    location: text("location"),
    city: text("city"),
    country: text("country"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    socialLinks: jsonb("social_links").$type(),
    images: jsonb("images").$type(),
    openingHours: text("opening_hours"),
    category: text("category"),
    tags: jsonb("tags").$type(),
    isVerified: boolean("is_verified").default(false),
    followersCount: integer("followers_count").default(0),
    likesCount: integer("likes_count").default(0),
    membersCount: integer("members_count").default(0),
    reviewsCount: integer("reviews_count").default(0),
    rating: doublePrecision("rating").default(0),
    ownerId: varchar("owner_id").references(() => users.id),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()),
    culturePassId: varchar("culture_pass_id").unique()
  }
);
var likes = pgTable(
  "likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    uniqueLike: uniqueIndex("unique_like").on(table.userId, table.targetId)
  })
);
var paymentMethods = pgTable(
  "payment_methods",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    label: text("label").notNull(),
    last4: text("last4"),
    brand: text("brand"),
    expiryMonth: integer("expiry_month"),
    expiryYear: integer("expiry_year"),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow()
  }
);
var sponsors = pgTable(
  "sponsors",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    socialLinks: jsonb("social_links").$type(),
    city: text("city"),
    country: text("country"),
    sponsorType: text("sponsor_type"),
    contactEmail: text("contact_email"),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    culturePassId: varchar("culture_pass_id")
  }
);
var eventSponsors = pgTable(
  "event_sponsors",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    eventId: varchar("event_id").notNull(),
    sponsorId: varchar("sponsor_id").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
    tier: text("tier").default("bronze"),
    logoPriority: integer("logo_priority").default(0),
    createdAt: timestamp("created_at").defaultNow()
  }
);
var sponsorPlacements = pgTable(
  "sponsor_placements",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sponsorId: varchar("sponsor_id").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
    placementType: text("placement_type").notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    weight: integer("weight").default(0),
    createdAt: timestamp("created_at").defaultNow()
  }
);
var perks = pgTable(
  "perks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description"),
    perkType: text("perk_type").notNull(),
    discountPercent: integer("discount_percent"),
    discountFixedCents: integer("discount_fixed_cents"),
    providerType: text("provider_type"),
    providerId: varchar("provider_id"),
    providerName: text("provider_name"),
    providerLogo: text("provider_logo"),
    city: text("city"),
    country: text("country"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    usageLimit: integer("usage_limit"),
    perUserLimit: integer("per_user_limit").default(1),
    usedCount: integer("used_count").default(0),
    isMembershipRequired: boolean("is_membership_required").default(false),
    requiredMembershipTier: text("required_membership_tier"),
    status: text("status").default("active"),
    category: text("category"),
    imageUrl: text("image_url"),
    culturePassId: varchar("culture_pass_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
  }
);
var perkRedemptions = pgTable(
  "perk_redemptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    perkId: varchar("perk_id").notNull().references(() => perks.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    transactionId: varchar("transaction_id"),
    redeemedAt: timestamp("redeemed_at").defaultNow()
  }
);
var notifications = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(),
    isRead: boolean("is_read").default(false),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId)
  })
);
var tickets = pgTable(
  "tickets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    eventId: varchar("event_id").notNull(),
    eventTitle: text("event_title").notNull(),
    eventDate: text("event_date"),
    eventTime: text("event_time"),
    eventVenue: text("event_venue"),
    tierName: text("tier_name"),
    quantity: integer("quantity").default(1),
    totalPrice: doublePrecision("total_price").default(0),
    currency: text("currency").default("AUD"),
    status: text("status").default("confirmed"),
    ticketCode: text("ticket_code"),
    qrCode: text("qr_code"),
    imageColor: text("image_color"),
    scannedAt: timestamp("scanned_at"),
    scannedBy: varchar("scanned_by"),
    platformFee: doublePrecision("platform_fee"),
    stripeFee: doublePrecision("stripe_fee"),
    organizerAmount: doublePrecision("organizer_amount"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeRefundId: text("stripe_refund_id"),
    paymentStatus: text("payment_status").default("pending"),
    culturePassId: varchar("culture_pass_id").unique(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => ({
    userIdIdx: index("tickets_user_id_idx").on(table.userId),
    eventIdIdx: index("tickets_event_id_idx").on(table.eventId),
    statusIdx: index("tickets_status_idx").on(table.status)
  })
);
var cpidRegistry = pgTable(
  "cpid_registry",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    culturePassId: varchar("culture_pass_id").unique().notNull(),
    targetId: varchar("target_id").unique().notNull(),
    entityType: text("entity_type").notNull(),
    createdAt: timestamp("created_at").defaultNow()
  }
);
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true
});
var insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true
});
var insertPerkSchema = createInsertSchema(perks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true
});

// server/db.ts
var connectionString = process.env.DATABASE_URL;
var pool = new pg.Pool({
  connectionString,
  ssl: connectionString?.includes("sslmode=") ? void 0 : { rejectUnauthorized: false }
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, sql as sql2, lte, gte } from "drizzle-orm";
import QRCode from "qrcode";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(data) {
    const [user] = await db.insert(users).values(data).returning();
    await db.insert(wallets).values({ userId: user.id });
    return user;
  }
  async updateUser(id, data) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }
  async getAllUsers() {
    return db.select().from(users).orderBy(users.createdAt);
  }
  // Profiles CRUD
  async getProfile(id) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }
  async getProfileBySlug(slug) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    return profile;
  }
  async getProfilesByType(entityType) {
    return db.select().from(profiles).where(eq(profiles.entityType, entityType)).orderBy(desc(profiles.createdAt));
  }
  async getAllProfiles() {
    return db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }
  async createProfile(data) {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }
  async updateProfile(id, data) {
    const [profile] = await db.update(profiles).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(profiles.id, id)).returning();
    return profile;
  }
  async deleteProfile(id) {
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }
  // Follows
  async follow(followerId, targetId, targetType) {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];
    const [follow] = await db.insert(follows).values({ followerId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql2`${users.followersCount} + 1` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql2`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql2`${profiles.followersCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return follow;
  }
  async unfollow(followerId, targetId) {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length === 0) return false;
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql2`GREATEST(${users.followersCount} - 1, 0)` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql2`GREATEST(${users.followingCount} - 1, 0)` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql2`GREATEST(${profiles.followersCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }
  async getFollowers(targetId) {
    return db.select().from(follows).where(eq(follows.targetId, targetId)).orderBy(desc(follows.createdAt));
  }
  async getFollowing(userId) {
    return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
  }
  async isFollowing(followerId, targetId) {
    const result = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    return result.length > 0;
  }
  // Likes
  async likeEntity(userId, targetId, targetType) {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];
    const [like] = await db.insert(likes).values({ userId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql2`${users.likesCount} + 1` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql2`${profiles.likesCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return like;
  }
  async unlikeEntity(userId, targetId) {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length === 0) return false;
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql2`GREATEST(${users.likesCount} - 1, 0)` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql2`GREATEST(${profiles.likesCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }
  async isLiked(userId, targetId) {
    const result = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    return result.length > 0;
  }
  // Reviews
  async getReviews(targetId) {
    return db.select().from(reviews).where(eq(reviews.targetId, targetId)).orderBy(desc(reviews.createdAt));
  }
  async createReview(data) {
    const [review] = await db.insert(reviews).values(data).returning();
    const allReviews = await this.getReviews(data.targetId);
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.update(profiles).set({
      reviewsCount: allReviews.length,
      rating: Math.round(avgRating * 10) / 10
    }).where(eq(profiles.id, data.targetId));
    return review;
  }
  async deleteReview(id) {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }
  // Payment Methods
  async getPaymentMethods(userId) {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
  }
  async createPaymentMethod(data) {
    if (data.isDefault) {
      await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, data.userId));
    }
    const [method] = await db.insert(paymentMethods).values(data).returning();
    return method;
  }
  async deletePaymentMethod(id) {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }
  async setDefaultPaymentMethod(userId, methodId) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    const [method] = await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, methodId)).returning();
    return method;
  }
  // Transactions
  async getTransactions(userId) {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }
  async createTransaction(data) {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }
  // Wallet
  async getWallet(userId) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }
  async addFunds(userId, amount) {
    let [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet) {
      [wallet] = await db.insert(wallets).values({ userId, balance: String(amount) }).returning();
    } else {
      [wallet] = await db.update(wallets).set({
        balance: sql2`${wallets.balance} + ${amount}`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(wallets.userId, userId)).returning();
    }
    await this.createTransaction({
      userId,
      type: "credit",
      amount: String(amount),
      description: "Wallet top-up",
      category: "wallet",
      status: "completed"
    });
    return wallet;
  }
  async deductFunds(userId, amount, description) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet || Number(wallet.balance || 0) < amount) return null;
    const [updated] = await db.update(wallets).set({
      balance: sql2`${wallets.balance} - ${amount}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(wallets.userId, userId)).returning();
    await this.createTransaction({
      userId,
      type: "debit",
      amount: String(amount),
      description,
      category: "payment",
      status: "completed"
    });
    return updated;
  }
  // Members (followers that are users)
  async getMembers(profileId) {
    const followerRecords = await db.select().from(follows).where(eq(follows.targetId, profileId));
    if (followerRecords.length === 0) return [];
    const userIds = followerRecords.map((f) => f.followerId);
    const members = [];
    for (const uid of userIds) {
      const user = await this.getUser(uid);
      if (user) members.push(user);
    }
    return members;
  }
  // === Sponsors ===
  async getSponsor(id) {
    const [s] = await db.select().from(sponsors).where(eq(sponsors.id, id));
    return s;
  }
  async getAllSponsors() {
    return db.select().from(sponsors).where(eq(sponsors.status, "active")).orderBy(desc(sponsors.createdAt));
  }
  async createSponsor(data) {
    const [s] = await db.insert(sponsors).values(data).returning();
    return s;
  }
  async updateSponsor(id, data) {
    const [s] = await db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning();
    return s;
  }
  async deleteSponsor(id) {
    const result = await db.update(sponsors).set({ status: "archived" }).where(eq(sponsors.id, id)).returning();
    return result.length > 0;
  }
  // Event Sponsors
  async getEventSponsors(eventId) {
    const es = await db.select().from(eventSponsors).where(eq(eventSponsors.eventId, eventId)).orderBy(desc(eventSponsors.logoPriority));
    const results = [];
    for (const e of es) {
      const sponsor = await this.getSponsor(e.sponsorId);
      results.push({ ...e, sponsor });
    }
    return results;
  }
  async addEventSponsor(eventId, sponsorId, tier) {
    const [es] = await db.insert(eventSponsors).values({ eventId, sponsorId, tier }).returning();
    return es;
  }
  async removeEventSponsor(id) {
    const result = await db.delete(eventSponsors).where(eq(eventSponsors.id, id)).returning();
    return result.length > 0;
  }
  // Sponsor Placements
  async getActivePlacements(placementType) {
    const now = /* @__PURE__ */ new Date();
    let query = db.select().from(sponsorPlacements);
    const placements = placementType ? await query.where(and(eq(sponsorPlacements.placementType, placementType), lte(sponsorPlacements.startDate, now), gte(sponsorPlacements.endDate, now))).orderBy(desc(sponsorPlacements.weight)) : await query.orderBy(desc(sponsorPlacements.weight));
    const results = [];
    for (const p2 of placements) {
      const sponsor = await this.getSponsor(p2.sponsorId);
      results.push({ ...p2, sponsor });
    }
    return results;
  }
  async createPlacement(data) {
    const [p2] = await db.insert(sponsorPlacements).values(data).returning();
    return p2;
  }
  // === Perks ===
  async getPerk(id) {
    const [p2] = await db.select().from(perks).where(eq(perks.id, id));
    return p2;
  }
  async getAllPerks() {
    return db.select().from(perks).where(eq(perks.status, "active")).orderBy(desc(perks.createdAt));
  }
  async getPerksByCategory(category) {
    return db.select().from(perks).where(and(eq(perks.status, "active"), eq(perks.category, category))).orderBy(desc(perks.createdAt));
  }
  async createPerk(data) {
    const [p2] = await db.insert(perks).values(data).returning();
    return p2;
  }
  async updatePerk(id, data) {
    const [p2] = await db.update(perks).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(perks.id, id)).returning();
    return p2;
  }
  async deletePerk(id) {
    const result = await db.update(perks).set({ status: "archived" }).where(eq(perks.id, id)).returning();
    return result.length > 0;
  }
  // Perk Redemptions
  async redeemPerk(perkId, userId, transactionId) {
    const perk = await this.getPerk(perkId);
    if (!perk || perk.status !== "active") return null;
    if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return null;
    const userRedemptions = await db.select().from(perkRedemptions).where(
      and(eq(perkRedemptions.perkId, perkId), eq(perkRedemptions.userId, userId))
    );
    if (perk.perUserLimit && userRedemptions.length >= perk.perUserLimit) return null;
    const [redemption] = await db.insert(perkRedemptions).values({ perkId, userId, transactionId }).returning();
    await db.update(perks).set({ usedCount: sql2`${perks.usedCount} + 1` }).where(eq(perks.id, perkId));
    return redemption;
  }
  async getUserRedemptions(userId) {
    const redemptions = await db.select().from(perkRedemptions).where(eq(perkRedemptions.userId, userId)).orderBy(desc(perkRedemptions.redeemedAt));
    const results = [];
    for (const r of redemptions) {
      const perk = await this.getPerk(r.perkId);
      results.push({ ...r, perk });
    }
    return results;
  }
  // === Memberships ===
  async getMembership(userId) {
    const [m] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.status, "active"))).orderBy(desc(memberships.createdAt));
    return m;
  }
  async createMembership(data) {
    const [m] = await db.insert(memberships).values(data).returning();
    return m;
  }
  async updateMembership(id, data) {
    const [m] = await db.update(memberships).set(data).where(eq(memberships.id, id)).returning();
    return m;
  }
  async getMembershipByStripeSubscription(subscriptionId) {
    const [m] = await db.select().from(memberships).where(eq(memberships.stripeSubscriptionId, subscriptionId));
    return m;
  }
  async cancelMembership(userId) {
    const existing = await this.getMembership(userId);
    if (!existing) return void 0;
    const [m] = await db.update(memberships).set({
      status: "cancelled",
      tier: "free",
      cashbackMultiplier: 1,
      badgeType: "none"
    }).where(eq(memberships.id, existing.id)).returning();
    return m;
  }
  async activatePlusMembership(userId, data) {
    const existing = await this.getMembership(userId);
    if (existing) {
      const [m2] = await db.update(memberships).set({
        tier: "plus",
        status: "active",
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        cashbackMultiplier: 1.02,
        badgeType: "plus",
        billingPeriod: data.billingPeriod,
        priceCents: data.priceCents,
        endDate: data.endDate,
        startDate: /* @__PURE__ */ new Date()
      }).where(eq(memberships.id, existing.id)).returning();
      return m2;
    }
    const [m] = await db.insert(memberships).values({
      userId,
      tier: "plus",
      status: "active",
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeCustomerId: data.stripeCustomerId,
      cashbackMultiplier: 1.02,
      badgeType: "plus",
      billingPeriod: data.billingPeriod,
      priceCents: data.priceCents,
      endDate: data.endDate
    }).returning();
    return m;
  }
  async getMemberCount() {
    const result = await db.select().from(memberships).where(
      and(eq(memberships.status, "active"), sql2`${memberships.tier} = 'plus'`)
    );
    return result.length;
  }
  // === Notifications ===
  async getNotifications(userId) {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async getUnreadCount(userId) {
    const result = await db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return result.length;
  }
  async createNotification(data) {
    const [n] = await db.insert(notifications).values(data).returning();
    return n;
  }
  async markNotificationRead(id) {
    const [n] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return n;
  }
  async markAllNotificationsRead(userId) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    return true;
  }
  async deleteNotification(id) {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }
  // === Tickets ===
  async getTickets(userId) {
    return db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt));
  }
  async getTicket(id) {
    const [t] = await db.select().from(tickets).where(eq(tickets.id, id));
    return t;
  }
  async createTicket(data) {
    const code = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const totalPrice = data.totalPrice ? Number(data.totalPrice) : 0;
    const platformFee = Math.round(totalPrice * 0.05 * 100) / 100;
    const stripeFee = Math.round((totalPrice * 0.029 + 0.3) * 100) / 100;
    const organizerAmount = Math.round((totalPrice - platformFee - stripeFee) * 100) / 100;
    let qrDataUrl = null;
    try {
      qrDataUrl = await QRCode.toDataURL(code, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
        errorCorrectionLevel: "M"
      });
    } catch {
    }
    const [t] = await db.insert(tickets).values({
      ...data,
      ticketCode: code,
      qrCode: qrDataUrl,
      platformFee: totalPrice > 0 ? platformFee : 0,
      stripeFee: totalPrice > 0 ? stripeFee : 0,
      organizerAmount: totalPrice > 0 ? organizerAmount : 0
    }).returning();
    return t;
  }
  async cancelTicket(id) {
    const [t] = await db.update(tickets).set({ status: "cancelled" }).where(eq(tickets.id, id)).returning();
    return t;
  }
  async updateTicketPayment(id, data) {
    const [t] = await db.update(tickets).set(data).where(eq(tickets.id, id)).returning();
    return t;
  }
  async getTicketByCode(code) {
    const [t] = await db.select().from(tickets).where(eq(tickets.ticketCode, code));
    return t;
  }
  async scanTicket(id, scannedBy) {
    const [t] = await db.update(tickets).set({
      status: "used",
      scannedAt: /* @__PURE__ */ new Date(),
      scannedBy
    }).where(eq(tickets.id, id)).returning();
    return t;
  }
  async getAllTickets() {
    return db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }
  async getTicketsByEvent(eventId) {
    return db.select().from(tickets).where(eq(tickets.eventId, eventId)).orderBy(desc(tickets.createdAt));
  }
  async getTicketCount(userId) {
    const result = await db.select().from(tickets).where(
      and(eq(tickets.userId, userId), eq(tickets.status, "confirmed"))
    );
    return result.length;
  }
  async backfillQRCodes() {
    const ticketsWithoutQR = await db.select().from(tickets).where(
      sql2`${tickets.qrCode} IS NULL AND ${tickets.ticketCode} IS NOT NULL`
    );
    let count = 0;
    for (const ticket of ticketsWithoutQR) {
      try {
        const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode, {
          width: 300,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
          errorCorrectionLevel: "M"
        });
        const totalPrice = ticket.totalPrice ? Number(ticket.totalPrice) : 0;
        const platformFee = Math.round(totalPrice * 0.05 * 100) / 100;
        const stripeFee = Math.round((totalPrice * 0.029 + 0.3) * 100) / 100;
        const organizerAmount = Math.round((totalPrice - platformFee - stripeFee) * 100) / 100;
        await db.update(tickets).set({
          qrCode: qrDataUrl,
          platformFee: totalPrice > 0 ? platformFee : 0,
          stripeFee: totalPrice > 0 ? stripeFee : 0,
          organizerAmount: totalPrice > 0 ? organizerAmount : 0
        }).where(eq(tickets.id, ticket.id));
        count++;
      } catch {
      }
    }
    return count;
  }
};
var storage = new DatabaseStorage();

// server/cpid.ts
import { eq as eq2 } from "drizzle-orm";
var CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function randomCpid(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}
async function generateCpid(targetId, entityType) {
  const [existing] = await db.select().from(cpidRegistry).where(eq2(cpidRegistry.targetId, targetId)).limit(1);
  if (existing) return existing.culturePassId;
  let attempts = 0;
  while (attempts < 20) {
    const length = attempts < 10 ? 6 : 7;
    const cpid = `CP-${randomCpid(length)}`;
    try {
      await db.insert(cpidRegistry).values({
        culturePassId: cpid,
        targetId,
        entityType
      });
      if (entityType === "user") {
        await db.update(users).set({ culturePassId: cpid }).where(eq2(users.id, targetId));
      } else if (entityType === "sponsor") {
        await db.update(sponsors).set({ culturePassId: cpid }).where(eq2(sponsors.id, targetId));
      } else if (entityType === "perk") {
        await db.update(perks).set({ culturePassId: cpid }).where(eq2(perks.id, targetId));
      } else if (entityType === "ticket") {
        await db.update(tickets).set({ culturePassId: cpid }).where(eq2(tickets.id, targetId));
      } else {
        await db.update(profiles).set({ culturePassId: cpid }).where(eq2(profiles.id, targetId));
      }
      return cpid;
    } catch (err) {
      if (err.code === "23505") {
        attempts++;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed to generate unique CPID after 20 attempts");
}
async function lookupCpid(cpid) {
  const normalized = cpid.trim().toUpperCase();
  const [entry] = await db.select().from(cpidRegistry).where(eq2(cpidRegistry.culturePassId, normalized)).limit(1);
  return entry ? { targetId: entry.targetId, entityType: entry.entityType } : null;
}
async function getAllRegistryEntries() {
  return db.select().from(cpidRegistry);
}

// server/stripeClient.ts
import Stripe from "stripe";
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);
  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X_REPLIT_TOKEN": xReplitToken
    }
  });
  const data = await response.json();
  connectionSettings = data.items?.[0];
  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret
  };
}
async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil"
  });
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}
async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}
var stripeSync = null;
async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import("stripe-replit-sync");
    const secretKey = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL,
        max: 2
      },
      stripeSecretKey: secretKey
    });
  }
  return stripeSync;
}

// server/errors.ts
var ErrorCodes = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  // Resources
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  PERK_NOT_FOUND: "PERK_NOT_FOUND",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  MEMBERSHIP_NOT_FOUND: "MEMBERSHIP_NOT_FOUND",
  // Tickets
  TICKET_ALREADY_SCANNED: "TICKET_ALREADY_SCANNED",
  TICKET_ALREADY_CANCELLED: "TICKET_ALREADY_CANCELLED",
  TICKET_EXPIRED: "TICKET_EXPIRED",
  TICKET_CANNOT_REFUND: "TICKET_CANNOT_REFUND",
  DUPLICATE_PURCHASE: "DUPLICATE_PURCHASE",
  // Payments
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  STRIPE_ERROR: "STRIPE_ERROR",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_INPUT: "INVALID_INPUT",
  // Perks
  PERK_LIMIT_REACHED: "PERK_LIMIT_REACHED",
  PERK_EXPIRED: "PERK_EXPIRED",
  MEMBERSHIP_REQUIRED: "MEMBERSHIP_REQUIRED",
  // Rate limit
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  // General
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR"
};
var AppError = class extends Error {
  constructor(code, statusCode, message) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
};
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          success: false,
          error: { code: err.code, message: err.message }
        });
      }
      console.error("Unhandled error:", err);
      return res.status(500).json({
        success: false,
        error: { code: ErrorCodes.INTERNAL_ERROR, message: "Something went wrong. Please try again." }
      });
    }
  };
}
var rateLimitMap = /* @__PURE__ */ new Map();
function rateLimit(key, maxRequests = 10, windowMs = 6e4) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count++;
  return true;
}

// server/routes.ts
function p(val) {
  return Array.isArray(val) ? val[0] : val;
}
async function registerRoutes(app2) {
  app2.get("/api/users", async (_req, res) => {
    const users2 = await storage.getAllUsers();
    res.json(users2);
  });
  app2.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(p(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(p(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
  app2.get("/api/profiles", async (req, res) => {
    const entityType = req.query.type;
    const profiles2 = entityType ? await storage.getProfilesByType(entityType) : await storage.getAllProfiles();
    res.json(profiles2);
  });
  app2.get("/api/profiles/:id", async (req, res) => {
    const profile = await storage.getProfile(p(req.params.id)) || await storage.getProfileBySlug(p(req.params.id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });
  app2.post("/api/profiles", async (req, res) => {
    try {
      const profile = await storage.createProfile(req.body);
      res.status(201).json(profile);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/profiles/:id", async (req, res) => {
    const profile = await storage.updateProfile(p(req.params.id), req.body);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });
  app2.delete("/api/profiles/:id", async (req, res) => {
    const deleted = await storage.deleteProfile(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true });
  });
  app2.post("/api/follow", async (req, res) => {
    const { followerId, targetId, targetType } = req.body;
    const follow = await storage.follow(followerId, targetId, targetType);
    res.json(follow);
  });
  app2.post("/api/unfollow", async (req, res) => {
    const { followerId, targetId } = req.body;
    const result = await storage.unfollow(followerId, targetId);
    res.json({ success: result });
  });
  app2.get("/api/followers/:targetId", async (req, res) => {
    const followers = await storage.getFollowers(p(req.params.targetId));
    res.json(followers);
  });
  app2.get("/api/following/:userId", async (req, res) => {
    const following = await storage.getFollowing(p(req.params.userId));
    res.json(following);
  });
  app2.get("/api/is-following", async (req, res) => {
    const { followerId, targetId } = req.query;
    const result = await storage.isFollowing(followerId, targetId);
    res.json({ isFollowing: result });
  });
  app2.post("/api/like", async (req, res) => {
    const { userId, targetId, targetType } = req.body;
    const like = await storage.likeEntity(userId, targetId, targetType);
    res.json(like);
  });
  app2.post("/api/unlike", async (req, res) => {
    const { userId, targetId } = req.body;
    const result = await storage.unlikeEntity(userId, targetId);
    res.json({ success: result });
  });
  app2.get("/api/is-liked", async (req, res) => {
    const { userId, targetId } = req.query;
    const result = await storage.isLiked(userId, targetId);
    res.json({ isLiked: result });
  });
  app2.get("/api/reviews/:targetId", async (req, res) => {
    const reviews2 = await storage.getReviews(p(req.params.targetId));
    res.json(reviews2);
  });
  app2.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.delete("/api/reviews/:id", async (req, res) => {
    const deleted = await storage.deleteReview(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ success: true });
  });
  app2.get("/api/members/:profileId", async (req, res) => {
    const members = await storage.getMembers(p(req.params.profileId));
    res.json(members);
  });
  app2.get("/api/payment-methods/:userId", async (req, res) => {
    const methods = await storage.getPaymentMethods(p(req.params.userId));
    res.json(methods);
  });
  app2.post("/api/payment-methods", async (req, res) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.delete("/api/payment-methods/:id", async (req, res) => {
    const deleted = await storage.deletePaymentMethod(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Payment method not found" });
    res.json({ success: true });
  });
  app2.put("/api/payment-methods/:userId/default/:methodId", async (req, res) => {
    const method = await storage.setDefaultPaymentMethod(p(req.params.userId), p(req.params.methodId));
    if (!method) return res.status(404).json({ error: "Method not found" });
    res.json(method);
  });
  app2.get("/api/transactions/:userId", async (req, res) => {
    const txs = await storage.getTransactions(p(req.params.userId));
    res.json(txs);
  });
  app2.get("/api/wallet/:userId", async (req, res) => {
    const wallet = await storage.getWallet(p(req.params.userId));
    res.json(wallet || { balance: 0, currency: "AUD" });
  });
  app2.post("/api/wallet/:userId/topup", async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.addFunds(p(req.params.userId), amount);
    res.json(wallet);
  });
  app2.post("/api/wallet/:userId/pay", async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.deductFunds(p(req.params.userId), amount, description);
    if (!wallet) return res.status(400).json({ error: "Insufficient funds" });
    res.json(wallet);
  });
  app2.get("/api/sponsors", async (_req, res) => {
    const sponsors2 = await storage.getAllSponsors();
    res.json(sponsors2);
  });
  app2.get("/api/sponsors/:id", async (req, res) => {
    const sponsor = await storage.getSponsor(p(req.params.id));
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });
  app2.post("/api/sponsors", async (req, res) => {
    try {
      const sponsor = await storage.createSponsor(req.body);
      res.status(201).json(sponsor);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/sponsors/:id", async (req, res) => {
    const sponsor = await storage.updateSponsor(p(req.params.id), req.body);
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });
  app2.delete("/api/sponsors/:id", async (req, res) => {
    const deleted = await storage.deleteSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Sponsor not found" });
    res.json({ success: true });
  });
  app2.get("/api/event-sponsors/:eventId", async (req, res) => {
    const sponsors2 = await storage.getEventSponsors(p(req.params.eventId));
    res.json(sponsors2);
  });
  app2.post("/api/event-sponsors", async (req, res) => {
    const { eventId, sponsorId, tier } = req.body;
    const es = await storage.addEventSponsor(eventId, sponsorId, tier || "bronze");
    res.status(201).json(es);
  });
  app2.delete("/api/event-sponsors/:id", async (req, res) => {
    const deleted = await storage.removeEventSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Event sponsor not found" });
    res.json({ success: true });
  });
  app2.get("/api/sponsor-placements", async (req, res) => {
    const type = req.query.type;
    const placements = await storage.getActivePlacements(type);
    res.json(placements);
  });
  app2.post("/api/sponsor-placements", async (req, res) => {
    const placement = await storage.createPlacement(req.body);
    res.status(201).json(placement);
  });
  app2.get("/api/perks", async (req, res) => {
    const category = req.query.category;
    const perks2 = category ? await storage.getPerksByCategory(category) : await storage.getAllPerks();
    res.json(perks2);
  });
  app2.get("/api/perks/:id", async (req, res) => {
    const perk = await storage.getPerk(p(req.params.id));
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });
  app2.post("/api/perks", async (req, res) => {
    try {
      const perk = await storage.createPerk(req.body);
      res.status(201).json(perk);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/perks/:id", async (req, res) => {
    const perk = await storage.updatePerk(p(req.params.id), req.body);
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });
  app2.delete("/api/perks/:id", async (req, res) => {
    const deleted = await storage.deletePerk(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Perk not found" });
    res.json({ success: true });
  });
  app2.post("/api/perks/:id/redeem", async (req, res) => {
    const { userId, transactionId } = req.body;
    const redemption = await storage.redeemPerk(p(req.params.id), userId, transactionId);
    if (!redemption) return res.status(400).json({ error: "Cannot redeem perk - limit reached or perk expired" });
    res.json(redemption);
  });
  app2.get("/api/redemptions/:userId", async (req, res) => {
    const redemptions = await storage.getUserRedemptions(p(req.params.userId));
    res.json(redemptions);
  });
  app2.get("/api/membership/member-count", async (_req, res) => {
    const count = await storage.getMemberCount();
    res.json({ count });
  });
  app2.get("/api/membership/:userId", async (req, res) => {
    const membership = await storage.getMembership(p(req.params.userId));
    res.json(membership || { tier: "free", status: "active" });
  });
  app2.post("/api/membership", async (req, res) => {
    try {
      const membership = await storage.createMembership(req.body);
      res.status(201).json(membership);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/membership/:id", async (req, res) => {
    const membership = await storage.updateMembership(p(req.params.id), req.body);
    if (!membership) return res.status(404).json({ error: "Membership not found" });
    res.json(membership);
  });
  app2.post("/api/membership/subscribe", async (req, res) => {
    try {
      const { userId, billingPeriod } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      if (!rateLimit(`subscribe:${clientIp}`, 3, 12e4)) {
        return res.status(429).json({ error: "Too many subscription attempts. Please wait and try again." });
      }
      if (!userId) return res.status(400).json({ error: "userId is required" });
      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}`;
      const isYearly = billingPeriod === "yearly";
      const priceAmount = isYearly ? 6900 : 799;
      const intervalStr = isYearly ? "year" : "month";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "CulturePass+",
              description: isYearly ? "CulturePass+ Annual Membership - Access. Advantage. Influence." : "CulturePass+ Monthly Membership - Access. Advantage. Influence."
            },
            unit_amount: priceAmount,
            recurring: { interval: intervalStr }
          },
          quantity: 1
        }],
        mode: "subscription",
        success_url: `${baseUrl}/api/membership/subscribe-success?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&billing_period=${billingPeriod}`,
        cancel_url: `${baseUrl}/api/membership/subscribe-cancel`,
        metadata: {
          userId,
          billingPeriod,
          membershipTier: "plus"
        }
      });
      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (e) {
      console.error("Membership subscribe error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app2.get("/api/membership/subscribe-success", async (req, res) => {
    try {
      const { session_id, user_id, billing_period } = req.query;
      if (session_id && user_id) {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const isYearly = billing_period === "yearly";
        const endDate = /* @__PURE__ */ new Date();
        if (isYearly) {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
        await storage.activatePlusMembership(user_id, {
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          billingPeriod: billing_period || "monthly",
          priceCents: isYearly ? 6900 : 799,
          endDate
        });
      }
      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome to CulturePass+</title>
        <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#EBF5FB,#D6EAF8);color:#1A5276}
        .container{text-align:center;padding:40px;max-width:400px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:28px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#2E86C1,#1A5276);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sub{font-size:16px;color:#5D6D7E;line-height:1.5}.badge{display:inline-block;background:linear-gradient(135deg,#2E86C1,#1A5276);color:white;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-top:16px}</style>
        </head><body><div class="container"><div class="icon">&#127758;</div><div class="title">Welcome to CulturePass+</div>
        <div class="sub">Your membership is now active. Enjoy early access, exclusive perks, and cashback rewards.</div>
        <div class="badge">Access. Advantage. Influence.</div>
        <div class="sub" style="margin-top:24px;font-size:14px">You can close this page and return to the app.</div></div></body></html>`);
    } catch (e) {
      console.error("Membership success error:", e);
      res.status(500).send("Error activating membership");
    }
  });
  app2.get("/api/membership/subscribe-cancel", async (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Subscription Cancelled</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fef2f2;color:#991b1b}
      .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}</style>
      </head><body><div class="container"><div class="icon">&#10005;</div><div class="title">Subscription Cancelled</div>
      <div class="sub">No worries! You can upgrade to CulturePass+ anytime. Close this page and return to the app.</div></div></body></html>`);
  });
  app2.post("/api/membership/cancel-subscription", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const membership = await storage.getMembership(userId);
      if (!membership || membership.tier === "free") {
        return res.status(400).json({ error: "No active membership to cancel" });
      }
      if (membership.stripeSubscriptionId) {
        try {
          const stripe = await getUncachableStripeClient();
          await stripe.subscriptions.cancel(membership.stripeSubscriptionId);
        } catch (stripeErr) {
          console.error("Stripe cancel error:", stripeErr.message);
        }
      }
      const cancelled = await storage.cancelMembership(userId);
      res.json({ success: true, membership: cancelled });
    } catch (e) {
      console.error("Cancel membership error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app2.get("/api/notifications/:userId", async (req, res) => {
    const notifs = await storage.getNotifications(p(req.params.userId));
    res.json(notifs);
  });
  app2.get("/api/notifications/:userId/unread-count", async (req, res) => {
    const count = await storage.getUnreadCount(p(req.params.userId));
    res.json({ count });
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notif = await storage.createNotification(req.body);
      res.status(201).json(notif);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/notifications/:id/read", async (req, res) => {
    const notif = await storage.markNotificationRead(p(req.params.id));
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  });
  app2.put("/api/notifications/:userId/read-all", async (req, res) => {
    await storage.markAllNotificationsRead(p(req.params.userId));
    res.json({ success: true });
  });
  app2.delete("/api/notifications/:id", async (req, res) => {
    const deleted = await storage.deleteNotification(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });
  app2.get("/api/tickets/:userId", async (req, res) => {
    const tickets2 = await storage.getTickets(p(req.params.userId));
    res.json(tickets2);
  });
  app2.get("/api/tickets/:userId/count", async (req, res) => {
    const count = await storage.getTicketCount(p(req.params.userId));
    res.json({ count });
  });
  app2.get("/api/ticket/:id", async (req, res) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });
  app2.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app2.put("/api/tickets/:id/cancel", async (req, res) => {
    const ticket = await storage.cancelTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });
  app2.post("/api/tickets/scan", async (req, res) => {
    try {
      const { ticketCode, scannedBy } = req.body;
      if (!ticketCode) return res.status(400).json({ error: "Ticket code is required" });
      const ticket = await storage.getTicketByCode(ticketCode);
      if (!ticket) return res.status(404).json({ error: "Invalid ticket code", valid: false });
      if (ticket.status === "used") {
        return res.status(400).json({
          error: "Ticket already scanned",
          valid: false,
          ticket,
          scannedAt: ticket.scannedAt
        });
      }
      if (ticket.status === "cancelled") {
        return res.status(400).json({ error: "Ticket has been cancelled", valid: false, ticket });
      }
      if (ticket.status === "expired") {
        return res.status(400).json({ error: "Ticket has expired", valid: false, ticket });
      }
      const updated = await storage.scanTicket(ticket.id, scannedBy || "staff");
      res.json({ valid: true, message: "Ticket scanned successfully", ticket: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.get("/api/tickets-all", async (_req, res) => {
    const allTickets = await storage.getAllTickets();
    res.json(allTickets);
  });
  app2.get("/api/tickets/event/:eventId", async (req, res) => {
    const eventTickets = await storage.getTicketsByEvent(p(req.params.eventId));
    res.json(eventTickets);
  });
  app2.post("/api/tickets/backfill-qr", async (_req, res) => {
    const count = await storage.backfillQRCodes();
    res.json({ message: `Backfilled ${count} tickets with QR codes` });
  });
  app2.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (e) {
      res.status(500).json({ error: "Failed to get Stripe publishable key" });
    }
  });
  app2.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency, ticketData } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      const stripe = await getUncachableStripeClient();
      const amountInCents = Math.round(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: (currency || "aud").toLowerCase(),
        metadata: {
          eventId: ticketData?.eventId || "",
          eventTitle: ticketData?.eventTitle || "",
          tierName: ticketData?.tierName || "",
          quantity: String(ticketData?.quantity || 1),
          userId: ticketData?.userId || ""
        }
      });
      const ticket = await storage.createTicket({
        ...ticketData,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "pending",
        status: "pending"
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode
      });
    } catch (e) {
      console.error("Create payment intent error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/stripe/create-checkout-session", wrapHandler(async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(`checkout:${clientIp}`, 5, 6e4)) {
      throw new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, 429, "Too many purchase attempts. Please wait a minute and try again.");
    }
    const { ticketData } = req.body;
    if (!ticketData || !ticketData.userId || !ticketData.eventId) {
      throw new AppError(ErrorCodes.MISSING_REQUIRED_FIELD, 400, "Ticket data with userId and eventId is required.");
    }
    if (!ticketData.totalPrice || ticketData.totalPrice <= 0) {
      throw new AppError(ErrorCodes.INVALID_AMOUNT, 400, "A valid ticket price is required.");
    }
    const existingTickets = await storage.getTickets(ticketData.userId);
    const pendingForEvent = existingTickets.find(
      (t) => t.eventId === ticketData.eventId && t.status === "pending" && t.paymentStatus === "pending"
    );
    if (pendingForEvent) {
      throw new AppError(ErrorCodes.DUPLICATE_PURCHASE, 409, "You already have a pending purchase for this event. Please complete or cancel it first.");
    }
    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}`;
    const ticket = await storage.createTicket({
      ...ticketData,
      paymentStatus: "pending",
      status: "pending"
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: (ticketData.currency || "aud").toLowerCase(),
          product_data: {
            name: `${ticketData.eventTitle} - ${ticketData.tierName}`,
            description: `${ticketData.quantity}x ticket(s)`
          },
          unit_amount: Math.round(ticketData.totalPrice * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${baseUrl}/api/stripe/checkout-success?session_id={CHECKOUT_SESSION_ID}&ticket_id=${ticket.id}`,
      cancel_url: `${baseUrl}/api/stripe/checkout-cancel?ticket_id=${ticket.id}`,
      metadata: {
        ticketId: ticket.id,
        eventId: ticketData.eventId || "",
        userId: ticketData.userId || ""
      }
    });
    if (session.payment_intent) {
      await storage.updateTicketPayment(ticket.id, {
        stripePaymentIntentId: session.payment_intent
      });
    }
    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        ticketId: ticket.id
      }
    });
  }));
  app2.get("/api/stripe/checkout-success", async (req, res) => {
    try {
      const { session_id, ticket_id } = req.query;
      if (session_id && ticket_id) {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === "paid") {
          await storage.updateTicketPayment(ticket_id, {
            paymentStatus: "paid",
            status: "confirmed",
            stripePaymentIntentId: session.payment_intent
          });
        }
      }
      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Successful</title>
        <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f0fdf4;color:#166534}
        .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}</style>
        </head><body><div class="container"><div class="icon">&#10003;</div><div class="title">Payment Successful!</div>
        <div class="sub">Your ticket has been confirmed. You can close this page and return to the app.</div></div></body></html>`);
    } catch (e) {
      res.status(500).send("Error processing payment confirmation");
    }
  });
  app2.get("/api/stripe/checkout-cancel", async (req, res) => {
    const { ticket_id } = req.query;
    if (ticket_id) {
      await storage.updateTicketPayment(ticket_id, {
        paymentStatus: "cancelled",
        status: "cancelled"
      });
    }
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Cancelled</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fef2f2;color:#991b1b}
      .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}</style>
      </head><body><div class="container"><div class="icon">&#10005;</div><div class="title">Payment Cancelled</div>
      <div class="sub">Your ticket purchase was cancelled. You can close this page and return to the app.</div></div></body></html>`);
  });
  app2.post("/api/stripe/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId, ticketId } = req.body;
      if (!paymentIntentId || !ticketId) {
        return res.status(400).json({ error: "paymentIntentId and ticketId required" });
      }
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "succeeded") {
        const ticket = await storage.updateTicketPayment(ticketId, {
          paymentStatus: "paid",
          status: "confirmed"
        });
        return res.json({ success: true, ticket });
      }
      return res.json({
        success: false,
        status: paymentIntent.status,
        message: `Payment status: ${paymentIntent.status}`
      });
    } catch (e) {
      console.error("Confirm payment error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/stripe/refund", wrapHandler(async (req, res) => {
    const { ticketId } = req.body;
    if (!ticketId) {
      throw new AppError(ErrorCodes.MISSING_REQUIRED_FIELD, 400, "Ticket ID is required.");
    }
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 404, "Ticket not found.");
    }
    if (ticket.status === "cancelled") {
      throw new AppError(ErrorCodes.TICKET_ALREADY_CANCELLED, 400, "This ticket has already been cancelled.");
    }
    if (ticket.status === "used") {
      throw new AppError(ErrorCodes.TICKET_CANNOT_REFUND, 400, "Cannot refund a ticket that has already been scanned.");
    }
    if (!ticket.stripePaymentIntentId) {
      const cancelled = await storage.cancelTicket(ticketId);
      return res.json({
        success: true,
        data: {
          message: "Ticket cancelled (no payment to refund)",
          ticket: cancelled
        }
      });
    }
    const stripe = await getUncachableStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: ticket.stripePaymentIntentId
    });
    const updated = await storage.updateTicketPayment(ticketId, {
      status: "cancelled",
      paymentStatus: "refunded",
      stripeRefundId: refund.id
    });
    return res.json({
      success: true,
      data: {
        message: "Payment refunded and ticket cancelled",
        refundId: refund.id,
        ticket: updated
      }
    });
  }));
  app2.post("/api/tickets/:id/scan", wrapHandler(async (req, res) => {
    const ticketId = p(req.params.id);
    const { scannedBy } = req.body;
    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 404, "Ticket not found.");
    }
    if (ticket.status === "used") {
      throw new AppError(ErrorCodes.TICKET_ALREADY_SCANNED, 400, "This ticket has already been scanned.");
    }
    if (ticket.status === "cancelled") {
      throw new AppError(ErrorCodes.TICKET_ALREADY_CANCELLED, 400, "This ticket has been cancelled and is no longer valid.");
    }
    if (ticket.paymentStatus !== "paid" && ticket.totalPrice && ticket.totalPrice > 0) {
      throw new AppError(ErrorCodes.PAYMENT_PENDING, 400, "This ticket has not been paid for yet.");
    }
    if (ticket.eventDate) {
      const [year, month, day] = ticket.eventDate.split("-").map(Number);
      if (year && month && day) {
        const eventDate = new Date(year, month - 1, day);
        const dayAfter = new Date(eventDate);
        dayAfter.setDate(dayAfter.getDate() + 1);
        if (/* @__PURE__ */ new Date() > dayAfter) {
          throw new AppError(ErrorCodes.TICKET_EXPIRED, 400, "This ticket has expired. The event date has passed.");
        }
      }
    }
    const updated = await storage.updateTicketPayment(ticketId, {
      status: "used",
      scannedAt: /* @__PURE__ */ new Date(),
      scannedBy: scannedBy || "staff"
    });
    return res.json({
      success: true,
      data: {
        message: "Ticket scanned successfully",
        ticket: updated
      }
    });
  }));
  app2.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const allTickets = await storage.getAllTickets();
      const allUsers = await storage.getAllUsers();
      const allPerks = await storage.getAllPerks();
      let totalRevenue = 0;
      let platformRevenue = 0;
      let organizerRevenue = 0;
      let scannedTickets = 0;
      let confirmedTickets = 0;
      let cancelledTickets = 0;
      const eventMap = /* @__PURE__ */ new Map();
      for (const t of allTickets) {
        totalRevenue += t.totalPrice || 0;
        platformRevenue += t.platformFee || 0;
        organizerRevenue += t.organizerAmount || 0;
        if (t.status === "used") scannedTickets++;
        else if (t.status === "confirmed") confirmedTickets++;
        else if (t.status === "cancelled") cancelledTickets++;
        let existing = eventMap.get(t.eventId);
        if (!existing) {
          existing = { eventId: t.eventId, eventTitle: t.eventTitle, tickets: 0, revenue: 0, scanned: 0, organizerAmount: 0 };
          eventMap.set(t.eventId, existing);
        }
        existing.tickets += t.quantity || 1;
        existing.revenue += t.totalPrice || 0;
        existing.organizerAmount += t.organizerAmount || 0;
        if (t.status === "used") existing.scanned += t.quantity || 1;
      }
      res.json({
        totalTickets: allTickets.length,
        confirmedTickets,
        scannedTickets,
        cancelledTickets,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        organizerRevenue: Math.round(organizerRevenue * 100) / 100,
        totalUsers: allUsers.length,
        totalPerks: allPerks.length,
        eventBreakdown: Array.from(eventMap.values()).sort((a, b) => b.revenue - a.revenue)
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.get("/api/tickets/:id/wallet/apple", async (req, res) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.culturepass.ticket",
      serialNumber: ticket.id,
      teamIdentifier: "CULTUREPASS",
      organizationName: "CulturePass",
      description: ticket.eventTitle,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: ticket.imageColor || "rgb(0, 122, 255)",
      eventTicket: {
        primaryFields: [{ key: "event", label: "EVENT", value: ticket.eventTitle }],
        secondaryFields: [
          { key: "date", label: "DATE", value: ticket.eventDate || "" },
          { key: "time", label: "TIME", value: ticket.eventTime || "" }
        ],
        auxiliaryFields: [
          { key: "venue", label: "VENUE", value: ticket.eventVenue || "" },
          { key: "tier", label: "TIER", value: ticket.tierName || "General" }
        ],
        backFields: [
          { key: "code", label: "TICKET CODE", value: ticket.ticketCode || "" },
          { key: "quantity", label: "QUANTITY", value: String(ticket.quantity || 1) }
        ]
      },
      barcode: {
        message: ticket.ticketCode || ticket.id,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      }
    };
    res.json({ pass: passData, message: "Apple Wallet pass generated. In production, this would be a downloadable .pkpass file." });
  });
  app2.get("/api/tickets/:id/wallet/google", async (req, res) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const passData = {
      id: `culturepass-${ticket.id}`,
      classId: "culturepass.event_ticket",
      eventName: { defaultValue: { language: "en", value: ticket.eventTitle } },
      dateTime: {
        start: ticket.eventDate ? `${ticket.eventDate}T${ticket.eventTime || "00:00"}` : void 0
      },
      venue: {
        name: { defaultValue: { language: "en", value: ticket.eventVenue || "" } }
      },
      ticketHolderName: "CulturePass Member",
      ticketNumber: ticket.ticketCode || ticket.id,
      seatInfo: {
        section: { defaultValue: { language: "en", value: ticket.tierName || "General" } }
      },
      barcode: {
        type: "QR_CODE",
        value: ticket.ticketCode || ticket.id
      },
      hexBackgroundColor: ticket.imageColor || "#007AFF"
    };
    res.json({ pass: passData, message: "Google Wallet pass generated. In production, this would redirect to Google Wallet save URL." });
  });
  app2.post("/api/dashboard/login", async (req, res) => {
    const { username, password } = req.body;
    const adminPassword = process.env.ADMIN_USER_PASSWORD || "admin123";
    if (username === "admin" && password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });
  app2.get("/api/cpid/registry", async (_req, res) => {
    const entries = await getAllRegistryEntries();
    res.json(entries);
  });
  app2.get("/api/cpid/lookup/:cpid", async (req, res) => {
    const result = await lookupCpid(p(req.params.cpid));
    if (!result) return res.status(404).json({ error: "CPID not found" });
    res.json(result);
  });
  app2.post("/api/cpid/generate", async (req, res) => {
    try {
      const { targetId, entityType } = req.body;
      if (!targetId || !entityType) return res.status(400).json({ error: "targetId and entityType are required" });
      const cpid = await generateCpid(targetId, entityType);
      res.json({ culturePassId: cpid, targetId, entityType });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/seed", async (_req, res) => {
    try {
      const existing = await storage.getAllProfiles();
      if (existing.length > 0) {
        return res.json({ message: "Already seeded", count: existing.length });
      }
      const seedProfiles = [
        { name: "Indian Community Australia", slug: "indian-community-au", entityType: "community", description: "Connecting Indian diaspora across Australia through events, culture, and community support.", category: "Cultural Community", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, socialLinks: { facebook: "https://facebook.com/indiancommunityau", instagram: "https://instagram.com/indiancommunityau" }, images: [], tags: ["indian", "cultural", "community"], followersCount: 2450, membersCount: 2450, rating: 4.8 },
        { name: "Chinese Cultural Society", slug: "chinese-cultural-society", entityType: "community", description: "Celebrating Chinese heritage and traditions in Australia and New Zealand.", category: "Cultural Community", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, socialLinks: { facebook: "https://facebook.com/chinesecultural", instagram: "https://instagram.com/chinesecultural" }, images: [], tags: ["chinese", "cultural"], followersCount: 1890, membersCount: 1890, rating: 4.7 },
        { name: "Filipino Network NZ", slug: "filipino-network-nz", entityType: "community", description: "Supporting Filipino community in New Zealand with events, resources, and networking.", category: "Cultural Community", city: "Auckland", country: "New Zealand", latitude: -36.8485, longitude: 174.7633, socialLinks: { instagram: "https://instagram.com/filipinonz" }, images: [], tags: ["filipino", "networking"], followersCount: 1200, membersCount: 1200, rating: 4.6 },
        { name: "CulturePass Events Pty Ltd", slug: "culturepass-events", entityType: "organisation", description: "Premier cultural events organiser connecting communities across Australia and New Zealand.", category: "Events Organisation", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, website: "https://culturepass.com", socialLinks: { linkedin: "https://linkedin.com/company/culturepass", twitter: "https://twitter.com/culturepass" }, images: [], tags: ["events", "multicultural"], followersCount: 5200, rating: 4.9 },
        { name: "Multicultural Arts Victoria", slug: "multicultural-arts-vic", entityType: "organisation", description: "Supporting and promoting culturally diverse arts and artists.", category: "Arts Organisation", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, website: "https://multiculturalarts.com.au", socialLinks: { facebook: "https://facebook.com/multiculturalartsvic", instagram: "https://instagram.com/multiculturalartsvic" }, images: [], tags: ["arts", "multicultural", "victoria"], followersCount: 3100, rating: 4.7 },
        { name: "Sydney Opera House", slug: "sydney-opera-house", entityType: "venue", description: "Iconic performing arts centre and UNESCO World Heritage Site.", category: "Performing Arts", city: "Sydney", country: "Australia", address: "Bennelong Point, Sydney NSW 2000", latitude: -33.8568, longitude: 151.2153, website: "https://sydneyoperahouse.com", socialLinks: { facebook: "https://facebook.com/sydneyoperahouse", instagram: "https://instagram.com/sydneyoperahouse", twitter: "https://twitter.com/sydneyoperahouse", youtube: "https://youtube.com/sydneyoperahouse" }, images: [], tags: ["opera", "performing arts", "landmark"], followersCount: 15e3, rating: 4.9, openingHours: "Mon-Sun: 9am-11pm" },
        { name: "Melbourne Convention Centre", slug: "melbourne-convention", entityType: "venue", description: "World-class convention and exhibition centre in South Wharf.", category: "Convention Centre", city: "Melbourne", country: "Australia", address: "1 Convention Centre Pl, South Wharf VIC 3006", latitude: -37.8252, longitude: 144.9529, website: "https://mcec.com.au", socialLinks: { linkedin: "https://linkedin.com/company/mcec" }, images: [], tags: ["convention", "events", "exhibitions"], followersCount: 8900, rating: 4.6, openingHours: "Mon-Sun: 8am-10pm" },
        { name: "Spice of India", slug: "spice-of-india", entityType: "business", description: "Authentic North Indian cuisine with traditional recipes and premium ingredients.", category: "Restaurant", city: "Sydney", country: "Australia", address: "42 Elizabeth Street, Sydney NSW 2000", latitude: -33.8718, longitude: 151.2082, phone: "02 9123 4567", socialLinks: { instagram: "https://instagram.com/spiceofindia", facebook: "https://facebook.com/spiceofindia" }, images: [], tags: ["indian", "restaurant", "fine dining"], followersCount: 890, rating: 4.5, openingHours: "Tue-Sun: 11am-10pm" },
        { name: "Sari Silk Boutique", slug: "sari-silk-boutique", entityType: "business", description: "Premium Indian fashion, bridal wear, and traditional clothing.", category: "Fashion", city: "Melbourne", country: "Australia", address: "156 Chapel Street, Prahran VIC 3181", latitude: -37.8508, longitude: 144.9931, socialLinks: { instagram: "https://instagram.com/sarisilk", tiktok: "https://tiktok.com/@sarisilk" }, images: [], tags: ["fashion", "indian", "bridal"], followersCount: 2300, rating: 4.7, openingHours: "Mon-Sat: 10am-6pm" },
        { name: "Dragon Palace", slug: "dragon-palace", entityType: "business", description: "Award-winning Chinese restaurant featuring Cantonese and Sichuan cuisine.", category: "Restaurant", city: "Auckland", country: "New Zealand", address: "95 Queen Street, Auckland 1010", latitude: -36.8461, longitude: 174.766, phone: "+64 9 555 1234", socialLinks: { facebook: "https://facebook.com/dragonpalace", instagram: "https://instagram.com/dragonpalace" }, images: [], tags: ["chinese", "restaurant"], followersCount: 1200, rating: 4.6, openingHours: "Mon-Sun: 11am-11pm" },
        { name: "City of Sydney Council", slug: "city-of-sydney", entityType: "council", description: "Local government authority for the City of Sydney, promoting multicultural events and community programs.", category: "Local Government", city: "Sydney", country: "Australia", address: "Town Hall House, 456 Kent St, Sydney NSW 2000", latitude: -33.8736, longitude: 151.2069, website: "https://cityofsydney.nsw.gov.au", socialLinks: { facebook: "https://facebook.com/cityofsydney", twitter: "https://twitter.com/cityofsydney", linkedin: "https://linkedin.com/company/cityofsydney" }, images: [], tags: ["government", "multicultural", "grants"], followersCount: 12e3, rating: 4.3 },
        { name: "Auckland Council", slug: "auckland-council", entityType: "council", description: "Auckland's local authority supporting diverse communities and cultural festivals.", category: "Local Government", city: "Auckland", country: "New Zealand", address: "135 Albert Street, Auckland 1010", latitude: -36.8485, longitude: 174.7633, website: "https://aucklandcouncil.govt.nz", socialLinks: { facebook: "https://facebook.com/aucklandcouncil", twitter: "https://twitter.com/aklcouncil" }, images: [], tags: ["government", "auckland"], followersCount: 9500, rating: 4.1 },
        { name: "Department of Home Affairs", slug: "dept-home-affairs", entityType: "government", description: "Australian Government department responsible for immigration, citizenship, and multicultural affairs.", category: "Federal Government", city: "Canberra", country: "Australia", website: "https://homeaffairs.gov.au", socialLinks: { twitter: "https://twitter.com/AusBorderForce", linkedin: "https://linkedin.com/company/department-of-home-affairs" }, images: [], tags: ["immigration", "citizenship", "multicultural"], followersCount: 25e3, rating: 3.8 },
        { name: "Ministry of Ethnic Communities", slug: "ministry-ethnic-communities", entityType: "government", description: "New Zealand government ministry focused on ethnic communities, promoting inclusion and diversity.", category: "National Government", city: "Wellington", country: "New Zealand", website: "https://ethniccommunities.govt.nz", socialLinks: { facebook: "https://facebook.com/ethniccommunities", twitter: "https://twitter.com/ethniccommNZ" }, images: [], tags: ["ethnic", "diversity", "inclusion"], followersCount: 8e3, rating: 4 },
        // Artists
        { name: "Priya Sharma", slug: "priya-sharma", entityType: "artist", description: "Classical Bharatanatyam dancer and choreographer bringing South Indian dance to Australian stages.", category: "Dancer", city: "Melbourne", country: "Australia", bio: "Award-winning dancer with 15+ years of experience performing at cultural festivals worldwide.", socialLinks: { instagram: "https://instagram.com/priyasharma", youtube: "https://youtube.com/priyasharma", spotify: "https://open.spotify.com/artist/priya" }, images: [], tags: ["dance", "bharatanatyam", "classical", "indian"], followersCount: 4500, rating: 4.9, isVerified: true },
        { name: "DJ Kai Lin", slug: "dj-kai-lin", entityType: "artist", description: "Fusion DJ blending Asian electronic beats with traditional Chinese instruments.", category: "Musician", city: "Sydney", country: "Australia", bio: "Headlining cultural festivals across Australia, NZ, and Asia since 2019.", socialLinks: { instagram: "https://instagram.com/djkailin", tiktok: "https://tiktok.com/@djkailin", spotify: "https://open.spotify.com/artist/djkailin" }, images: [], tags: ["dj", "electronic", "fusion", "chinese"], followersCount: 8200, rating: 4.8, isVerified: true },
        { name: "Ravi Patel", slug: "ravi-patel", entityType: "artist", description: "Stand-up comedian known for hilarious cross-cultural comedy about the immigrant experience.", category: "Comedian", city: "Auckland", country: "New Zealand", bio: "Netflix special 'Between Two Cultures' streamed in 12 countries.", socialLinks: { instagram: "https://instagram.com/ravipatel", youtube: "https://youtube.com/ravipatel", twitter: "https://twitter.com/ravipatel" }, images: [], tags: ["comedy", "stand-up", "indian"], followersCount: 12e3, rating: 4.7, isVerified: true }
      ];
      const createdProfiles = [];
      for (const p2 of seedProfiles) {
        const created = await storage.createProfile(p2);
        createdProfiles.push(created);
      }
      for (const cp of createdProfiles) {
        await generateCpid(cp.id, cp.entityType);
      }
      const seedSponsors = [
        { name: "Telstra", description: "Australia's leading telecommunications company supporting multicultural communities.", logoUrl: "", websiteUrl: "https://telstra.com.au", sponsorType: "corporate", city: "Melbourne", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/telstra", twitter: "https://twitter.com/telstra" }, contactEmail: "partnerships@telstra.com.au" },
        { name: "ANZ Bank", description: "Banking partner empowering diverse communities through financial inclusion programs.", logoUrl: "", websiteUrl: "https://anz.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/anz-bank", facebook: "https://facebook.com/ANZAustralia" }, contactEmail: "community@anz.com.au" },
        { name: "SBS Australia", description: "Australia's multicultural and multilingual broadcaster, celebrating diversity in media.", logoUrl: "", websiteUrl: "https://sbs.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { instagram: "https://instagram.com/sbsaustralia", twitter: "https://twitter.com/SBS" }, contactEmail: "partnerships@sbs.com.au" },
        { name: "Auckland Foundation", description: "Community trust supporting cultural initiatives and events in Auckland.", logoUrl: "", websiteUrl: "https://aucklandfoundation.org.nz", sponsorType: "local", city: "Auckland", country: "New Zealand", socialLinks: { facebook: "https://facebook.com/aucklandfoundation" }, contactEmail: "grants@aucklandfoundation.org.nz" }
      ];
      const createdSponsors = [];
      for (const s of seedSponsors) {
        const created = await storage.createSponsor(s);
        createdSponsors.push(created);
      }
      for (const cs of createdSponsors) {
        await generateCpid(cs.id, "sponsor");
      }
      const seedPerks = [
        { title: "20% Off First Event Ticket", description: "Get 20% off your first event ticket purchase on CulturePass.", perkType: "discount_percent", discountPercent: 20, providerType: "platform", providerName: "CulturePass", category: "tickets", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3), usageLimit: 1e3, perUserLimit: 1 },
        { title: "Free Entry to Community Meetups", description: "Attend any community meetup event for free this month.", perkType: "free_ticket", providerType: "platform", providerName: "CulturePass", category: "events", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3), usageLimit: 500, perUserLimit: 3 },
        { title: "$10 Off at Spice of India", description: "Enjoy $10 off your meal when you dine at Spice of India.", perkType: "discount_fixed", discountFixedCents: 1e3, providerType: "business", providerName: "Spice of India", category: "dining", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3), usageLimit: 200, perUserLimit: 2 },
        { title: "Early Access to Festival Tickets", description: "Premium members get 48-hour early access to major festival ticket sales.", perkType: "early_access", providerType: "platform", providerName: "CulturePass", category: "tickets", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3) },
        { title: "VIP Upgrade at Diwali Festival", description: "Free VIP upgrade for CulturePass members at the Diwali Festival.", perkType: "vip_upgrade", providerType: "sponsor", providerName: "Telstra", category: "events", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3), usageLimit: 50 },
        { title: "15% Off Sari Silk Boutique", description: "Show your CulturePass app for 15% off any purchase at Sari Silk Boutique.", perkType: "discount_percent", discountPercent: 15, providerType: "business", providerName: "Sari Silk Boutique", category: "shopping", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3), usageLimit: 300, perUserLimit: 2 },
        { title: "$5 Wallet Cashback", description: "Get $5 credited to your CulturePass Wallet on your next ticket purchase over $30.", perkType: "cashback", discountFixedCents: 500, providerType: "platform", providerName: "CulturePass", category: "wallet", startDate: /* @__PURE__ */ new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3), usageLimit: 1e3, perUserLimit: 1 }
      ];
      for (const pk of seedPerks) {
        await storage.createPerk(pk);
      }
      const demoPassword = process.env.DEMO_USER_PASSWORD || "demo123";
      const demoUser = await storage.createUser({ username: "demo", password: demoPassword });
      await storage.updateUser(demoUser.id, {
        displayName: "Alex Chen",
        email: "alex@culturepass.com",
        bio: "Cultural explorer and community builder. Passionate about connecting people through shared heritage.",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        socialLinks: { instagram: "https://instagram.com/alexchen", linkedin: "https://linkedin.com/in/alexchen", twitter: "https://twitter.com/alexchen" },
        images: [],
        latitude: -33.8688,
        longitude: 151.2093
      });
      await generateCpid(demoUser.id, "user");
      const adminPassword = process.env.ADMIN_USER_PASSWORD;
      if (!adminPassword) {
        throw new Error("ADMIN_USER_PASSWORD environment variable is required for seeding the super admin account");
      }
      const adminUser = await storage.createUser({ username: "superadmin", password: adminPassword });
      await storage.updateUser(adminUser.id, {
        displayName: "Super Admin",
        email: "jiobaba369@gmail.com",
        bio: "CulturePass Super Administrator",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        role: "super_admin",
        isVerified: true
      });
      await generateCpid(adminUser.id, "user");
      const notifData = [
        { userId: demoUser.id, title: "Welcome to CulturePass!", message: "Start exploring cultural events and communities near you.", type: "system" },
        { userId: demoUser.id, title: "Diwali Festival 2026", message: "Early bird tickets are now available! Book before they sell out.", type: "event" },
        { userId: demoUser.id, title: "New Perk Available", message: "Get 20% off your first event ticket purchase.", type: "perk" },
        { userId: demoUser.id, title: "Community Update", message: "Indian Community Australia posted a new event.", type: "community" }
      ];
      for (const n of notifData) {
        await storage.createNotification(n);
      }
      const ticketData = [
        { userId: demoUser.id, eventId: "evt-001", eventTitle: "Diwali Festival of Lights 2026", eventDate: "2026-10-25", eventTime: "6:00 PM", eventVenue: "Sydney Opera House Forecourt", tierName: "VIP", quantity: 2, totalPrice: 120, currency: "AUD", status: "confirmed", imageColor: "#FF6B35" },
        { userId: demoUser.id, eventId: "evt-002", eventTitle: "Chinese New Year Gala", eventDate: "2026-02-17", eventTime: "7:30 PM", eventVenue: "Melbourne Convention Centre", tierName: "General", quantity: 1, totalPrice: 45, currency: "AUD", status: "used", imageColor: "#E74C3C" },
        { userId: demoUser.id, eventId: "evt-003", eventTitle: "Bollywood Night Live", eventDate: "2026-03-15", eventTime: "8:00 PM", eventVenue: "Darling Harbour Theatre", tierName: "Premium", quantity: 3, totalPrice: 225, currency: "AUD", status: "confirmed", imageColor: "#9B59B6" },
        { userId: demoUser.id, eventId: "evt-004", eventTitle: "Cultural Food Festival", eventDate: "2026-04-10", eventTime: "11:00 AM", eventVenue: "Centennial Park", tierName: "General", quantity: 2, totalPrice: 30, currency: "AUD", status: "confirmed", imageColor: "#2ECC71" }
      ];
      for (const t of ticketData) {
        await storage.createTicket(t);
      }
      await storage.createMembership({ userId: demoUser.id, tier: "plus" });
      await storage.addFunds(demoUser.id, 45.5);
      res.json({ message: "Seeded successfully", profiles: seedProfiles.length, sponsors: seedSponsors.length, perks: seedPerks.length, users: 1, tickets: ticketData.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/webhookHandlers.ts
var WebhookHandlers = class {
  static async processWebhook(payload, signature) {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. Received type: " + typeof payload + ". FIX: Ensure webhook route is registered BEFORE app.use(express.json())."
      );
    }
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }
};

// server/index.ts
import { runMigrations } from "stripe-replit-sync";
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log("WARNING: DATABASE_URL not set, skipping Stripe initialization");
    return;
  }
  try {
    log("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    log("Stripe schema ready");
    const stripeSync2 = await getStripeSync();
    log("Setting up managed webhook...");
    try {
      const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || process.env.REPLIT_DEV_DOMAIN}`;
      const result = await stripeSync2.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`
      );
      log(`Webhook configured: ${result?.webhook?.url || "managed"}`);
    } catch (webhookErr) {
      log("Webhook setup skipped (non-critical):", webhookErr.message);
    }
    stripeSync2.syncBackfill().then(() => log("Stripe data synced")).catch((err) => log("Error syncing Stripe data:", err));
  } catch (error) {
    log("Failed to initialize Stripe:", error);
  }
}
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const dashboardPath = path.resolve(process.cwd(), "server", "templates", "dashboard.html");
  const dashboardTemplate = fs.existsSync(dashboardPath) ? fs.readFileSync(dashboardPath, "utf-8") : null;
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path === "/dashboard") {
      if (dashboardTemplate) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(dashboardTemplate);
      }
      return res.status(404).send("Dashboard not found");
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({ error: "Missing stripe-signature" });
      }
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        if (!Buffer.isBuffer(req.body)) {
          console.error("STRIPE WEBHOOK ERROR: req.body is not a Buffer");
          return res.status(500).json({ error: "Webhook processing error" });
        }
        await WebhookHandlers.processWebhook(req.body, sig);
        res.status(200).json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ error: "Webhook processing error" });
      }
    }
  );
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: false }));
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  await initStripe();
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
