/*
 📄 File: src/app/api/chat/route.ts
 🧠 Description:
 Standard POST chat endpoint using Groq SDK.
 Accepts messages from frontend, prepends a system message,
 and returns assistant's reply as JSON.
*/

import Groq from "groq-sdk";

// Initialize Groq client using environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // make sure GROQ_API_KEY exists in .env
});

export const POST = async (req: Request) => {
  try {
    // Parse request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    // Prepend system message
    const systemMessage = {
      role: "system",
      content: `
You are FATE, an automated financial assistant.
- Keep responses concise and to the point.
- Use bullet points "-" for lists when providing recommendations.
- Use numbered steps "1., 2." for procedures.
- Always provide a 1-2 line summary first.
- End with "Next steps" if actionable items exist.
- Do NOT return long paragraphs; avoid unnecessary wording.
- Respect language rules and do not share sensitive info like SSNs or card numbers.
`,
    };

    const chatMessages = [systemMessage, ...messages];

    // Request completion from Groq
    const chatOutput = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
    });

    // Extract assistant reply
    const reply = chatOutput.choices?.[0]?.message?.content || "";

    // Return JSON response
    return Response.json({ reply }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
