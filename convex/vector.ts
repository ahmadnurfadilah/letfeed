"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const similarFeedbacks = action({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, { embedding }) => {
    let results;
    results = await ctx.vectorSearch("feedbacks", "by_embedding", {
      vector: embedding,
      limit: 6,
    });
    const rows: any = await ctx.runQuery(internal.feedbacks.fetchResults, {
      results,
    });
    return rows;
  },
});

export async function embed(text: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY environment variable not set!");
  }
  const req = { input: text, model: "text-embedding-ada-002" };
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(req),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI API error: ${msg}`);
  }
  const json = await resp.json();
  const vector = json["data"][0]["embedding"];
  return vector;
}
