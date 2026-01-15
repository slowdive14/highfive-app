import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const dayOfWeek = v.union(
  v.literal("mon"),
  v.literal("tue"),
  v.literal("wed"),
  v.literal("thu"),
  v.literal("fri"),
  v.literal("sat"),
  v.literal("sun")
);

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    childId: v.string(),
    date: v.string(), // YYYY-MM-DD
    time: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    recurrence: v.object({
      type: v.union(
        v.literal("none"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("biweekly"),
        v.literal("monthly")
      ),
      days: v.optional(v.array(dayOfWeek)),
    }),
  }),

  children: defineTable({
    name: v.string(),
    shape: v.union(
      v.literal("circle"),
      v.literal("square"),
      v.literal("star"),
      v.literal("triangle"),
      v.literal("diamond")
    ),
  }),

  users: defineTable({
    kakaoId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  }).index("by_kakaoId", ["kakaoId"]),
});
