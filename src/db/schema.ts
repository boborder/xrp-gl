import { uuid, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  uuid: uuid('uuid').defaultRandom().primaryKey(),
  account: text("account").unique().notNull(),
  name: text("name").unique(),
  age: text("age"),
  avatar: text("avatar"),
  bio: text("bio"),
  currency: text("currency"),
  country: text("country"),
  did: text("did"),
  email: text("email"),
  gender: text("gender"),
  job: text("job"),
  lang: text("lang"),
  locate: text("locate"),
  paystring: text("paystring"),
  sns: text("sns"),
  tel: text("tel"),
  url: text("url"),
  done: boolean("done").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type InsUsers = typeof users.$inferInsert;
export type SelUsers = typeof users.$inferSelect;
