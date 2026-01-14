import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 자녀 조회
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("children").collect();
  },
});

// 자녀 추가
export const add = mutation({
  args: {
    name: v.string(),
    shape: v.union(
      v.literal("circle"),
      v.literal("square"),
      v.literal("star"),
      v.literal("triangle"),
      v.literal("diamond")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("children", args);
  },
});

// 자녀 수정
export const update = mutation({
  args: {
    id: v.id("children"),
    name: v.optional(v.string()),
    shape: v.optional(
      v.union(
        v.literal("circle"),
        v.literal("square"),
        v.literal("star"),
        v.literal("triangle"),
        v.literal("diamond")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// 자녀 삭제
export const remove = mutation({
  args: { id: v.id("children") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
