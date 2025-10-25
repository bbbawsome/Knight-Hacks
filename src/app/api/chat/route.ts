/*
 📄 File: src/app/api/chat/route.ts
 🧠 Description:
 This file defines a POST API route for a chat endpoint using the Groq SDK.
 It should accept an array of messages from the client, prepend a system message,
 call the Groq model, and return the assistant's response to the frontend.

 🧩 What to do in this file:
 Write code in the section below (marked with "!!!! ADD RELAVANT SEARCH CODE HERE !!!!") to 
 implement the Search in the VectorDB. Use MongoDB vector db & Xenova/all-MiniLM-L6-v2 embedding model.
*/

import { Pipeline, pipeline } from "@xenova/transformers";
import Groq from "groq-sdk";
import { MongoClient } from "mongodb";

const groq = new Groq();

// Lazy Loading to create pipeline for embedding model
let embedderModel: ReturnType<Pipeline> | null = null;
const getEmbedder = async () => {
  if (!embedderModel) {
    embedderModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedderModel;
};

export const POST = async (req: Request) => {
  try {
    // Get the message from HTTP request
    const { messages } = await req.json();
    if (!messages) {
      return Response.json({ error: "Messages are Missing" }, { status: 400 });
    }

    // Get last message
    const lastMessage = messages[messages.length - 1].content;

    // Get embedding for last input
    const embedder = await getEmbedder();
    const emb = await embedder(lastMessage, {
      pooling: "mean",
      normalize: true,
    });
    const queryEmbedding = Array.from(emb.data);

    // Connect to collection
    const client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME!);

    // Retrieve the document
    const similarDoc = await collection
      .aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: "embedding",
            limit: 3,
            numCandidates: 100,
            similarity: "cosine",
            index: "vector_index",
          },
        },
      ])
      .toArray();
    await client.close();

    // Combine into single string
    const relavantContext = similarDoc.map((doc) => doc.text).join("\n\n");

    // Create a System Message
    const systemMessages = {
      role: "system",
      content: `You are KnightBot, the official chatbot for AI@UCF (Artificial Intelligence at the University of Central Florida).
                Your job is to help students, faculty, and visitors with any questions they have about AI@UCF, including:
                  - Research labs, faculty, and ongoing projects
                  - Courses, majors, and academic opportunities related to AI
                  - Events, hackathons, and workshops hosted by AI@UCF
                  - How to join, collaborate, or get involved-
                  General info about UCF’s AI community and resources

                Tone & Style:
                  - Speak like a friendly, knowledgeable UCF student who’s excited about AI.
                  - Be **brief, clear, and helpful** — no fluff. Keep responses short.
                  - When unsure, admit it and suggest the best next step (e.g., contact info, links, or offices).
                
                Guidelines:
                - Always refer to “AI@UCF” as a UCF-affiliated organization focused on advancing AI research, education, and innovation.
                - If a user asks something not directly about AI@UCF, still try to connect it back to UCF’s AI ecosystem or direct them to relevant UCF resources.
                - If the question is outside UCF or AI context (e.g., “Explain quantum computing”), answer briefly and then tie it back to how AI@UCF might relate.
                - Keep answers engaging but professional — think “tech-savvy campus guide,” not corporate chatbot.
        
        ---CONTEXT/RELAVANT INFO---
        ${relavantContext}
        `,
    };
    const chatMessages = [systemMessages, ...messages];

    // Get response from groq
    const chatOutput = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
    });
    const reply = chatOutput.choices[0]?.message?.content || "";

    // Return to frontend
    return Response.json({ reply }, { status: 200 });
  } catch (err) {
    // Error Occured return 500 status code
    console.error("Error Occurred:", err);
    return Response.json({ error: "Error Occured" }, { status: 500 });
  }
};