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
    matched_items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: {
            type: "string",
            minLength: 1,
          },
          quantity_found: {
            type: "integer",
            minimum: 1,
          },
        },
        required: ["id", "quantity_found"],
      },
    },
  },
  required: ["matched_items"],
} as const;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const itemsRaw = formData.get("items");

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }

    if (!itemsRaw || typeof itemsRaw !== "string") {
      return NextResponse.json(
        { error: "Items payload is required." },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsRaw) as Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      expiration?: string;
    }>;

    const bytes = Buffer.from(await image.arrayBuffer()).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Return only a JSON object that matches the schema.",
                "You are matching items visible in a photo to an existing inventory list.",
                "Only return ids from the provided list that clearly appear in the image.",
                "For each matched item, estimate how many of that item are visible in the image as quantity_found.",
                "Do not invent ids.",
                "If an item is uncertain, leave it out.",
                "Here is the current inventory list as JSON:",
                JSON.stringify(items),
              ].join("\n"),
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${bytes}`,
              detail: "auto",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "matched_delete_items",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json(
        { error: "Model returned no structured output." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(response.output_text) as {
      matched_items?: Array<{ id: string; quantity_found: number }>;
    };

    return NextResponse.json({
      matched_items: Array.isArray(parsed.matched_items)
        ? parsed.matched_items
        : [],
    });
  } catch (error) {
    console.error("vision-delete-items route error", error);

    return NextResponse.json(
      { error: "Failed to compare image against current items." },
      { status: 500 }
    );
  }
}