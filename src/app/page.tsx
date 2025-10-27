/*
 📄 File: src/app/page.tsx
 🧠 Frontend UI for FATE - Personal Financial Assistant
 - Chat interface with messages and suggestions
 - PlanCard for habit/budget planning
*/

"use client";
import { useState, useRef, useEffect, MouseEvent } from "react";

// --- Types ---
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Habit = {
  id: string;
  label: string;
};

// --- Mock PlanCard Data ---
const planTitle = "Personal Finance Plan";
const planSubtitle = "Select habits you want to track";
const habits: Habit[] = [
  { id: "saving", label: "Save 10% of income" },
  { id: "no-spend", label: "No unnecessary spending for a week" },
  { id: "budget-review", label: "Review weekly budget" },
];
const ruleOptions = ["Conservative", "Moderate", "Aggressive"];
const defaultRule = "Moderate";

// --- Main Component ---
export default function Home() {
  // === Chat States ===
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- Scroll to bottom when messages update ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Suggested Questions ---
  const suggestedQuestions: string[] = [
    "Is my information secure?",
    "What are some good habits to avoid overspending?",
    "What should my spending limits be for this year?",
    "I would like to speak to an agent",
  ];

  const filteredSuggestions = suggestedQuestions.filter((q) => {
    const lowerQ = q.toLowerCase();
    const lowerInput = input.trim().toLowerCase();
    const alreadyAsked = messages.some(
      (m) => m.role === "user" && m.content.trim().toLowerCase() === lowerQ
    );
    return (
      lowerInput.length > 0 &&
      lowerQ.includes(lowerInput) &&
      lowerQ !== lowerInput &&
      !alreadyAsked
    );
  });

  const shouldShowSuggestions =
    showSuggestions && input.trim().length > 0 && filteredSuggestions.length > 0;

  // --- Send Chat Message ---
  const sendMessage = async (msg?: string) => {
    const userMessage = msg || input;
    if (!userMessage.trim()) return;
    setLoading(true);
    setShowSuggestions(false);

    const newUserMessage: Message = { role: "user", content: userMessage };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error response:", text);
        throw new Error("Server error");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "Error: No response received.",
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error fetching chat:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // --- Suggestion Click Handler ---
  const handleSuggestionClick = (q: string, e: MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    setInput(q);
    setShowSuggestions(false);
  };

  // --- PlanCard States ---
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedRule, setSelectedRule] = useState<string>(defaultRule);

  const toggleHabit = (id: string) => {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const startPlan = () => {
    console.log("Plan started:", { selectedHabits, selectedRule });
    alert("Plan started! Check console for details.");
  };

  const dismissPlan = () => {
    setSelectedHabits([]);
    setSelectedRule(defaultRule);
    alert("Plan dismissed");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen text-gray-100 p-4 overflow-hidden"
      style={{
        backgroundColor: "#171717",
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "95px 95px",
      }}
    >
      {/* === Background Glows === */}
      <div className="absolute w-24 h-24 bg-blue-500/10 rounded-lg top-10 left-20 blur-lg"></div>
      <div className="absolute w-32 h-32 bg-indigo-400/10 rounded-lg bottom-16 right-24 blur-xl"></div>
      <div className="absolute w-16 h-16 bg-purple-500/10 rounded-lg top-1/2 left-1/3 blur-md"></div>

      {/* === Logo === */}
      <div className="absolute top-6 left-6 z-30">
        <img
          src="https://cdn.prod.website-files.com/6609abf72c8e3c5d5355183d/6609c9f66123cc5a78441dfe_OneEthos%20Logo%20-%20%20WHT-p-800.png"
          alt="OneEthos Logo"
          className="w-36 h-auto object-contain"
        />
      </div>

      {/* === Page Title === */}
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl font-bold text-white"> Virtual Financial Advisor</h1>
      </div>

      {/* === Main Flex Row: Chat + PlanCard === */}
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row gap-6 z-10">
        {/* --- Chat Column --- */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* Chat Messages */}
          <div className="bg-gray-700 rounded-2xl p-4 h-[60vh] overflow-y-auto space-y-2 border border-gray-800">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 text-sm max-w-[75%] break-words ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
            {loading && (
              <div className="flex justify-start">
                <p className="text-gray-400 text-sm italic">Chatbot is thinking...</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Hello, I am FATE. How may I assist you?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              className="w-full bg-gray-800 rounded-xl p-3 pr-14 outline-none text-gray-100 placeholder-gray-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#3278fa] hover:bg-[#2763c8] text-white px-4 py-1.5 rounded-lg text-sm transition-all duration-150 active:scale-95 shadow-md"
            >
              Send
            </button>

            {/* Suggestions Dropdown */}
            {shouldShowSuggestions && (
              <ul className="absolute w-full bg-gray-800 border border-gray-700 rounded-xl mt-1 max-h-48 overflow-y-auto z-20">
                {filteredSuggestions.map((q, i) => (
                  <li
                    key={i}
                    className="p-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                    onMouseDown={(e) => handleSuggestionClick(q, e)}
                  >
                    {q}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- Right Column: PlanCard --- */}
        <div className="flex-shrink-0 w-full md:w-80 bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">{planTitle}</h2>
            <p className="text-gray-400 text-sm">{planSubtitle}</p>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            {habits.map((h) => (
              <label key={h.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedHabits.includes(h.id)}
                  onChange={() => toggleHabit(h.id)}
                  className="w-4 h-4"
                />
                <span>{h.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-sm">Budget rule:</span>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="bg-gray-700 text-gray-100 rounded px-2 py-1 text-sm"
            >
              {ruleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between mt-3">
            <button
              onClick={startPlan}
              className="bg-[#3278fa] hover:bg-[#2763c8] text-white px-4 py-1.5 rounded-lg text-sm transition-all"
            >
              Start plan
            </button>
            <button
              onClick={dismissPlan}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm transition-all"
            >
              Not now
            </button>
          </div>
          <p className="text-gray-500 text-xs text-center mt-2">
            Educational info, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
