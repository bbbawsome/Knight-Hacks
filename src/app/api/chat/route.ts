/*
 📄 File: src/app/api/chat/route.ts
 🧠 Description:
 This file defines a POST API route for a chat endpoint using the Groq SDK.
 It should accept an array of messages from the client, prepend a system message,
 call the Groq model, and return the assistant's response to the frontend.

 🧩 What to do in this file:
 Write code in the section below (marked with "!!!! ADD CHATBOT API CODE HERE !!!!") to implement the POST function to handle the request: process incoming messages,
 call `groq.chat.completions.create`, and return the assistant's reply as JSON.
*/

import Groq from "groq-sdk";

const groq = new Groq();

export const POST = async (req: Request) => {
  /* !!!! ADD CHATBOT API CODE HERE !!!! */
};
