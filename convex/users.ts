import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to Create/Update User (used by kakaoLogin action)
export const saveUser = mutation({
    args: {
        kakaoId: v.string(),
        name: v.string(),
        email: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_kakaoId", (q) => q.eq("kakaoId", args.kakaoId))
            .first();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
            });
            return existingUser._id;
        } else {
            const newUserId = await ctx.db.insert("users", {
                kakaoId: args.kakaoId,
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
            });
            return newUserId;
        }
    },
});
