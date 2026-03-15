import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: {
            type: "string",
            minLength: 1,
          },
          quantity: {
            type: "integer",
            minimum: 1,
          },
          category: {
            type: "string",
            enum: ["food", "clothing", "hygiene", "supplies"],
          },
        },
        required: ["name", "quantity", "category"],
      },
    },
  },
  required: ["items"],
} as const;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Return only a JSON object matching the schema.",
                "Generate a practical wishlist group for the request",
                "Only include concrete physical items.",
                "Each item must have name, quantity, and category.",
                "Allowed categories are: food, clothing, hygiene, supplies.",
                `Prompt: ${prompt}`,
              ].join(" "),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wishlist_group",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    const parsed = JSON.parse(response.output_text || '{"items":[]}') as {
      items?: Array<{
        name: string;
        quantity: number;
        category: "food" | "clothing" | "hygiene" | "supplies";
      }>;
    };

    return NextResponse.json({
      items: Array.isArray(parsed.items) ? parsed.items : [],
    });
  } catch (error) {
    console.error("generate-wishlist-group route error", error);

    return NextResponse.json(
      { error: "Failed to generate wishlist group." },
      { status: 500 }
    );
  }
}