import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
      daysOfWeek: v.optional(v.array(v.number())),
      endDate: v.optional(v.string()),
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
});
