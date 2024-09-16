import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTeam = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.id);
    return team;
  },
});

export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    style: v.optional(
      v.object({
        button_bg: v.string(),
        button_color: v.string(),
        button_text: v.string(),
        button_position: v.string(),
        form_bg: v.string(),
        form_color: v.string(),
        form_title: v.string(),
        form_subtitle: v.string(),
        form_rate_text: v.string(),
        form_details_text: v.string(),
        form_button_text: v.string(),
      }),
    ),
  },
  handler: async (ctx, { id, name, description, style }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // update the team
    await ctx.db.patch(id, {
      name,
      description,
      style,
    });
  },
});
