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
          quantity: {
            type: "integer",
            minimum: 1,
          },
          name: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["quantity", "name"],
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

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }

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
                "Look at this image and identify each distinct type of physical item visible.",
                "Group identical items together and estimate the quantity for each group.",
                "Use short concrete item names like 'toothbrushes', 'winter coats', 'blankets', 'granola bars'.",
                "Do not include anything outside the image.",
                "Do not add commentary.",
              ].join(" "),
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
          name: "detected_items",
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
      items?: Array<{ quantity: number; name: string }>;
    };

    return NextResponse.json({
      items: Array.isArray(parsed.items) ? parsed.items : [],
    });
  } catch (error) {
    console.error("vision-items route error", error);

    return NextResponse.json(
      { error: "Failed to detect items from image." },
      { status: 500 }
    );
  }
}