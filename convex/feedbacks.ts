import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: { rate: v.number(), description: v.string(), teamId: v.id("teams"), embedding: v.array(v.float64()), sentiment: v.string(), aiResponse: v.string() },
  handler: async (ctx, { rate, description, teamId, embedding, sentiment, aiResponse }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    // Send a new feedback
    await ctx.db.insert("feedbacks", {
      teamId: teamId,
      description: description,
      rate: rate,
      embedding: embedding,
      aiResponse: aiResponse,
      sentiment: sentiment,
    });
  },
});
