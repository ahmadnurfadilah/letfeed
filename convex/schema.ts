import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    teams: v.optional(v.array(v.id("teams"))),
  }),
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),
  teams: defineTable({
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
    members: v.array(v.id("users")),
    feedbacks: v.array(v.id("feedbacks")),
    feedbackTags: v.array(v.id("feedbackTags")),
  }),
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(),
  })
    .index("teamId", ["teamId"])
    .index("userId", ["userId"]),
  customers: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    feedbacks: v.optional(v.array(v.id("feedbacks"))),
  }).index("teamId", ["teamId"]),
  feedbacks: defineTable({
    teamId: v.id("teams"),
    customerId: v.optional(v.id("customers")),
    type: v.optional(v.string()),
    rate: v.optional(v.number()),
    description: v.optional(v.string()),
    aiResponse: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    isResolved: v.optional(v.boolean()),
    embedding: v.array(v.float64()),
  })
    .index("teamId", ["teamId"])
    .index("customerId", ["customerId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["description", "sentiment"],
    }),
  feedbackTags: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    total: v.number(),
  }).index("teamId", ["teamId"]),
});
