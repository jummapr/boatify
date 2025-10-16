import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMany = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();

        return users;
    }
});

export const add = mutation({
    args: {name: v.string()},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new Error("Missing organization");
        }

        throw new Error("User creation is disabled for now");

        const user = await ctx.db.insert("users", {name: args.name});

        return user;
    }
})

