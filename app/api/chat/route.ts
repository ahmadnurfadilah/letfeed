import { openai } from "@ai-sdk/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { streamText, convertToCoreMessages } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const formatMessage = (message: any) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  const { messages, team, session } = await req.json();

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  // get similiar data
  const relateds = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: "json",
      path: "vector:similarData",
      args: {
        teamId: team._id,
        query: currentMessageContent,
      },
    }),
  }).then((res) => res.json());

  const relatedValues = relateds ? relateds.value : [];
  const context = relatedValues.map((r: any) => r.description).join("\n- ");

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToCoreMessages(messages),
    system: `You are a smart assistant who helps users analyze feedback for their company. Here is the user profile: \n- Name: ${session?.user?.name}\n\n
    Here is the feedback list the company has received:
    ${context}

    Rules:
    - Format the results in markdown
    - If you don't know the answer, just say you don't know. Don't try to make up an answer
    - Answer concisely & in detail`,
  });

  return result.toDataStreamResponse();
}
