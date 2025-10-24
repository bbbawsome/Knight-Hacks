/*
 📄 File: src/app/api/stream/route.ts
 🧠 Description:
 This file defines a POST API route for a streaming chat endpoint using the Groq SDK.
 It accepts an array of messages from the client, prepends a system message, and
 streams the assistant's response back to the frontend in real-time.
  
 🧩 What to do in this file:
 Write code inside the section below (marked with "!!!! ADD STREAMING LOGIC HERE !!!!") to 
 stream the Groq chat output to the frontend by reading chunks from `chatOutput`, encode 
 them, and enqueue into a ReadableStream.
 */

import Groq from "groq-sdk";

const groq = new Groq();

export const POST = async (req: Request) => {
  try {
    // Get the message from HTTP request
    const { messages } = await req.json();
    if (!messages) {
      return Response.json({ error: "Messages are Missing" }, { status: 400 });
    }

    // Create a System Message
    const systemMessages = {
      role: "system",
      content:
        "You are a helpful AI assistant. Keep responses concise and friendly",
    };
    const chatMessages = [systemMessages, ...messages];

    // Get response from groq
    const chatOutput = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
      stream: true, // Turn on stream param
    });

    /* !!!! ADD STREAMING LOGIC HERE !!!! */
  } catch (err) {
    console.error("Error Occurred:", err);
    return Response.json({ error: "Error Occured" }, { status: 500 });
  }
};
