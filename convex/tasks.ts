import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 태스크 조회
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

// 태스크 추가
export const add = mutation({
  args: {
    title: v.string(),
    childId: v.string(),
    date: v.string(),
    time: v.string(),
    endTime: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

// 태스크 수정
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    childId: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    recurrence: v.optional(
      v.object({
        type: v.union(
          v.literal("none"),
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("biweekly"),
          v.literal("monthly")
        ),
        daysOfWeek: v.optional(v.array(v.number())),
        endDate: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// 태스크 삭제
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
