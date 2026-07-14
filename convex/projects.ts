import { mutation, query } from "./_generated/server";
import { v } from "convex/values"
import { verifyAuth } from "./verifyAuth";

export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);
        await ctx.db.insert("projects", {
            name: args.name,
            ownerId: identity?.subject,
            updatedAt: Date.now(),
        })
    }
})

export const getPartial = query({
    args:{
        limit: v.number()
    },
    handler: async (ctx, arg) => {
        const identity = await verifyAuth(ctx);

        const query = await ctx.db.query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
        .order("desc")
        .take(arg.limit);

        return query;
    }
}) 

export const get = query({
    args:{},
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const query = await ctx.db.query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
        .order('desc')
        .collect();

        return query;
    }
})

export const getById = query({
    args:{ 
        Id: v.id("projects")
    },

    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects" , args.Id);
        if(!project){
            throw new Error("Project not found");
        }

        if(project.ownerId !== identity.subject){
            throw new Error ("Unauthorized Access");
        }

        return project;
    }
})

export const rename = mutation({
    args:{ 
        Id: v.id("projects"),
        name: v.string()
    },

    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects" , args.Id);
        if(!project){
            throw new Error("Project not found");
        }

        if(project.ownerId !== identity.subject){
            throw new Error ("Unauthorized Access");
        }

        await ctx.db.patch("projects", args.Id, {
            name: args.name,
            updatedAt: Date.now()
        })

    }
})


export const deleteProject = mutation({
    args: {
        projectId: v.id("projects")
    },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.projectId)
    }
})