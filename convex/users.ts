import { mutation, query } from "./_generated/server";
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
// Generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const generateAccessCode = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const code = generateCode();
        await ctx.db.patch(args.userId, { accessCode: code });
        return code;
    },
});

export const verifyAccessCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_accessCode", (q) => q.eq("accessCode", args.code))
            .first();

        if (!user) return null;

        const children = await ctx.db
            .query("children")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        return {
            user,
            children,
        };
    },
});
