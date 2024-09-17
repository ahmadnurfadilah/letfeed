import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, mutation, query } from "./_generated/server";
import { stopWords } from "../lib/stop-words";

export type SearchResult = {
  _id: string;
  _score: number;
  description: string | undefined;
  sentiment: string | undefined;
};

export const getFeedback = query({
  args: { id: v.id("feedbacks") },
  handler: async (ctx, args) => {
    const feedback = await ctx.db.get(args.id);
    return feedback;
  },
});

export const getFeedbacks = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const feedbacks = await ctx.db
      .query("feedbacks")
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .order("asc")
      .collect();

    return feedbacks;
  },
});

export const send = mutation({
  args: {
    rate: v.number(),
    description: v.string(),
    teamId: v.id("teams"),
    embedding: v.array(v.float64()),
    sentiment: v.string(),
    aiResponse: v.string(),
  },
  handler: async (
    ctx,
    { rate, description, teamId, embedding, sentiment, aiResponse },
  ) => {
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

    // Send a feedback tags
    const textSplitted = description
      .toLowerCase()
      .replace(/[.,?!]/g, "")
      .split(/\s+/);

    textSplitted.map(async (ts: string) => {
      const excludeWords = stopWords;
      if (!excludeWords.includes(ts.trim().toLowerCase())) {
        const wordTag = await ctx.db
          .query("feedbackTags")
          .filter((q) =>
            q.and(
              q.eq(q.field("teamId"), teamId),
              q.eq(q.field("name"), ts.trim()),
            ),
          )
          .collect();

        if (wordTag.length > 0) {
          await ctx.db.patch(wordTag[0]._id, {
            total: wordTag[0].total + 1,
          });
        } else {
          await ctx.db.insert("feedbackTags", {
            teamId: teamId,
            name: ts.trim(),
            total: 1,
          });
        }
      }
    });
  },
});

export const fetchResults = internalQuery({
  args: {
    results: v.array(v.object({ _id: v.id("feedbacks"), _score: v.float64() })),
  },
  handler: async (ctx, args) => {
    const out: SearchResult[] = [];
    for (const result of args.results) {
      const doc = await ctx.db.get(result._id);
      if (!doc) {
        continue;
      }
      out.push({
        _id: doc._id,
        _score: result._score,
        description: doc.description,
        sentiment: doc.sentiment,
      });
    }
    return out;
  },
});
