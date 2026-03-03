"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Dumbbell,
  UtensilsCrossed,
  Target,
  Zap,
  Loader2,
} from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const quickPrompts = [
  {
    icon: Dumbbell,
    label: "Workout Plan",
    prompt: "Create a workout plan for muscle gain",
  },
  {
    icon: UtensilsCrossed,
    label: "Nutrition Tips",
    prompt: "What should I eat for muscle recovery?",
  },
  {
    icon: Target,
    label: "Form Check",
    prompt: "How do I improve my squat form?",
  },
  {
    icon: Zap,
    label: "Motivation",
    prompt: "How can I stay motivated to work out consistently?",
  },
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your personal AI fitness coach. I can help you with workout plans, nutrition advice, exercise form tips, and answer any fitness questions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      const assistantId = (Date.now() + 1).toString();
      let fullContent = "";

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent } : m
          )
        );
      }

      if (!fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, I couldn't generate a response. Please try again." }
              : m
          )
        );
      }
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage.includes("rate limited")
            ? `${errorMessage} In the meantime, feel free to explore other features!`
            : `Sorry, there was an error: ${errorMessage}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/5 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400/20 to-violet-500/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Fitness Coach</h1>
          <p className="text-xs text-slate-400">Powered by Google Gemini AI</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-brand-400/20 border border-brand-400/30 ml-8"
                  : "bg-slate-800/60 border border-white/5 mr-8"
              }`}
            >
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                {msg.role === "user" ? "You" : "AI Coach"}
              </p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {msg.content}
                {isLoading && msg === messages[messages.length - 1] && msg.role === "assistant" && !msg.content && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce animation-delay-200" />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce animation-delay-400" />
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.prompt)}
              className="flex items-center gap-2 p-3 rounded-xl bg-brand-400/10 border border-brand-400/20
                         text-xs text-white font-medium hover:bg-brand-400/20 hover:border-brand-400/30 transition-all"
            >
              <qp.icon className="w-4 h-4 text-brand-400 flex-shrink-0" />
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask your fitness question..."
          className="flex-1 px-4 py-3 bg-slate-800/60 border border-white/5 rounded-xl text-sm text-white
                     placeholder-slate-500 outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/20 transition-all"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 bg-gradient-to-r from-brand-400 to-brand-500 rounded-xl text-white font-semibold
                     text-sm transition-all hover:shadow-brand disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
