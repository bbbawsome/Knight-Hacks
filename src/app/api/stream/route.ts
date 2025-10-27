/*
 📄 File: src/app/api/stream/route.ts
 🧠 Description:
 This file defines a POST API route for a streaming chat endpoint using the Groq SDK.
 It accepts an array of messages from the client, prepends a system message, and
 streams the assistant's response back to the frontend in real-time.
*/

import Groq from "groq-sdk";

const groq = new Groq();

export const POST = async (req: Request) => {
  try {
    // Get the messages from the HTTP request
    const { messages } = await req.json();
    if (!messages) {
      return Response.json({ error: "Messages are missing" }, { status: 400 });
    }

    // Create a system message
    const systemMessage = {
      role: "system",
      content:
        "You are a helpful AI assistant. Keep responses concise and friendly",
    };
    const chatMessages = [systemMessage, ...messages];

    // Request streaming response from Groq
    const chatOutput = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
      stream: true,
    });

    // Encode text for streaming
    const encoder = new TextEncoder();

    // Create a ReadableStream to stream chunks to frontend
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatOutput) {
            const text = chunk.choices?.[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Error streaming chat:", err);
          controller.error(err);
        }
      },
    });

    // Return the stream as plain text
    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Error occurred in POST /stream:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}; // ← THIS CLOSING BRACE WAS MISSING
