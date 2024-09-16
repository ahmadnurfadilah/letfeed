import { NextResponse } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const AI_RESPONSE = `We are developing a product. User given feedback for us, please provide a summary or suggestion how to address common issues raised to act for us. Format the results in markdown. Here is the user feedback: {input}`;
const TEXT_CLASIFY = `Classify the sentiment of the message
Input: I had a terrible experience with this store. The clothes were of poor quality and overpriced.
Output: negative

Input: The clothing selection is decent, but the customer service needs improvement. It was just an okay experience.
Output: neutral

Input: I absolutely love shopping here! The staff is so helpful, and I always find stylish and affordable clothes.
Output: positive

Input: {input}
Output:
`;

export async function POST(req: Request) {
  const body = await req.json();
  const apiKey = process.env.OPENAI_API_KEY!;
  console.log("apiKey", apiKey);

  try {
    // Classify Text
    const promptClassify = ChatPromptTemplate.fromTemplate(TEXT_CLASIFY);
    const formattedPromptClassify = await promptClassify.format({
      input: body.text,
    });
    const modelClassify = new ChatOpenAI({
      temperature: 0.2,
    });
    const sentiment = await modelClassify.invoke(formattedPromptClassify);

    // aiResponse feedback
    const promptResponse = ChatPromptTemplate.fromTemplate(AI_RESPONSE);
    const formattedPromptResponse = await promptResponse.format({
      input: body.text,
    });
    const modelResponse = new ChatOpenAI({
      temperature: 0.7,
    });
    const aiResponse = await modelResponse.invoke(formattedPromptResponse);

    const texts = [`${body.text}`];
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      dimensions: 1536,
    });
    const vector = await embeddings.embedDocuments(texts);

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: {
          vector: vector[0],
          sentiment: sentiment.content,
          aiResponse: aiResponse.content,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 },
    );
  }
}
