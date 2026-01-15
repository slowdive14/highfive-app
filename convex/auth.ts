import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// User model for internal use
interface KakaoUser {
    id: number;
    properties?: {
        nickname: string;
        profile_image: string;
        thumbnail_image: string;
    };
    kakao_account?: {
        email?: string;
        profile?: {
            nickname: string;
            profile_image_url: string;
        };
    };
}

// Define result type explicitly
type KakaoLoginResult = {
    userId: Id<"users">;
    name: string;
    avatarUrl: string | undefined;
    email: string | undefined;
};

// Public Action: Exchange Code -> Token -> User Profile -> Save User
export const kakaoLogin = action({
    args: {
        code: v.string(),
        redirectUri: v.string(),
    },
    returns: v.object({
        userId: v.id("users"),
        name: v.string(),
        avatarUrl: v.optional(v.string()),
        email: v.optional(v.string()),
    }),
    handler: async (ctx, args): Promise<KakaoLoginResult> => {
        const clientId = process.env.KAKAO_REST_API_KEY;
        if (!clientId) {
            throw new Error("KAKAO_REST_API_KEY is not configured in Convex environment variables");
        }

        // A. Exchange Code for Access Token
        const tokenParams = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            redirect_uri: args.redirectUri,
            code: args.code,
        });

        const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams,
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Failed to exchange token: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // B. Get User Info
        const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error("Failed to fetch Kakao user profile");
        }

        const kakaoUser: KakaoUser = await userResponse.json();

        // C. Extract Profile Data
        const kakaoId = kakaoUser.id.toString();
        const name =
            kakaoUser.properties?.nickname ||
            kakaoUser.kakao_account?.profile?.nickname ||
            "Unknown User";
        const email = kakaoUser.kakao_account?.email;
        const avatarUrl =
            kakaoUser.properties?.profile_image ||
            kakaoUser.kakao_account?.profile?.profile_image_url;

        // D. Save to Database via Mutation
        const userId = await ctx.runMutation(api.users.saveUser, {
            kakaoId,
            name,
            email,
            avatarUrl,
        });

        return {
            userId,
            name,
            avatarUrl,
            email,
        };
    },
});

// Simple Query to get basic user info by ID
export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
