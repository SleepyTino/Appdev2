import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

const SYSTEM_PROMPT = `You are a professional fitness coach and personal trainer named "FitLife AI Coach". 
You provide helpful, accurate, and motivating fitness advice. 
Your expertise includes:
- Workout planning and programming
- Exercise form and technique
- Nutrition and diet advice
- Injury prevention and recovery
- Motivation and mental fitness
- Weight management strategies

Guidelines:
- Keep responses concise but informative
- Use bullet points for lists
- Be encouraging and supportive
- If asked about medical conditions, recommend consulting a doctor
- Focus on evidence-based advice
- Personalize advice when the user shares their details`;

export async function POST(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only for route handlers
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call Gemini API with streaming - try multiple models for quota fallback
    const requestBody = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser question: ${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    let geminiResponse: Response | null = null;
    let lastError = "";

    for (const model of MODELS) {
      const apiUrl = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(GEMINI_API_KEY)}`;
      console.log(`Trying model: ${model}`);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (res.ok) {
        geminiResponse = res;
        console.log(`Success with model: ${model}`);
        break;
      }

      const errorData = await res.text();
      console.error(`Model ${model} failed (${res.status}):`, errorData.slice(0, 200));
      lastError = errorData;

      // Only retry on rate limit (429) or model not found (404)
      if (res.status !== 429 && res.status !== 404) {
        return NextResponse.json(
          { error: `Gemini API error: ${res.status}` },
          { status: 502 }
        );
      }
    }

    if (!geminiResponse) {
      return NextResponse.json(
        { error: "All AI models are currently rate limited. Please try again in a minute." },
        { status: 429 }
      );
    }

    // Stream the response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process SSE events
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const text =
                    parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch {
                  // Skip malformed JSON chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
