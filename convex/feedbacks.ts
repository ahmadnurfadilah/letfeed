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

export const getFeedbackBySentiment = internalQuery({
  args: {
    teamId: v.id("teams"),
    sentiment: v.string(),
  },
  handler: async (ctx, args) => {
    let feedbacks;

    if (args.sentiment === "all") {
      feedbacks = await ctx.db
        .query("feedbacks")
        .filter((q) => q.eq(q.field("teamId"), args.teamId))
        .order("asc")
        .collect();
    } else {
      feedbacks = await ctx.db
        .query("feedbacks")
        .filter((q) =>
          q.and(
            q.eq(q.field("teamId"), args.teamId),
            q.eq(q.field("sentiment"), args.sentiment),
          ),
        )
        .order("asc")
        .collect();
    }

    return feedbacks;
  },
});

export const getTopKeywordStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const user = await ctx.db.get(userId);
    if (user === null) {
      throw new Error("User was deleted");
    }

    const data = await ctx.db
      .query("feedbackTags")
      .filter((q) => q.eq(q.field("teamId"), user.currentTeamId))
      .collect();

    const keywords = data.map((o) => ({ value: o.name, count: o.total }));
    return keywords;
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }

    const user = await ctx.db.get(userId);
    if (user === null) {
      throw new Error("User was deleted");
    }

    const feedbacks = await ctx.db
      .query("feedbacks")
      .filter((q) => q.eq(q.field("teamId"), user.currentTeamId))
      .collect();

    const feedbacksOpen = await ctx.db
      .query("feedbacks")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamId"), user.currentTeamId),
          q.eq(q.field("isResolved"), false),
        ),
      )
      .collect();

    const feedbacksResolved = await ctx.db
      .query("feedbacks")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamId"), user.currentTeamId),
          q.eq(q.field("isResolved"), true),
        ),
      )
      .collect();

    const ratingAverage =
      feedbacks.reduce((acc, feedback) => {
        return acc + feedback!.rate!;
      }, 0) / feedbacks.length;

    const sentimentCounts = feedbacks.reduce(
      (acc, feedback) => {
        if (feedback!.sentiment === "positive") acc.Positive++;
        else if (feedback!.sentiment === "negative") acc.Negative++;
        else if (feedback!.sentiment === "neutral") acc.Neutral++;
        return acc;
      },
      { Positive: 0, Negative: 0, Neutral: 0 },
    );

    // Calculate sentiment percentages
    const totalFeedbacks = feedbacks.length;
    const sentiment = [
      {
        name: "positive",
        count: sentimentCounts.Positive,
        percentage: (sentimentCounts.Positive / totalFeedbacks) * 100,
      },
      {
        name: "negative",
        count: sentimentCounts.Negative,
        percentage: (sentimentCounts.Negative / totalFeedbacks) * 100,
      },
      {
        name: "neutral",
        count: sentimentCounts.Neutral,
        percentage: (sentimentCounts.Neutral / totalFeedbacks) * 100,
      },
    ];

    return {
      feedbacksAdded: feedbacks.length,
      feedbacksOpen: feedbacksOpen.length,
      feedbacksResolved: feedbacksResolved.length,
      ratingAverage: ratingAverage,
      sentiment: sentiment,
    };
  },
});
