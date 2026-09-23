import { NextResponse } from "next/server";
import { GeminiError, generateGeminiResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await generateGeminiResponse({
      messages: body?.messages,
      signal: req.signal,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }
    if (error instanceof GeminiError) {
      return new NextResponse(error.message, { status: error.status });
    }
    return new NextResponse("Unable to generate a response. Please try again.", { status: 500 });
  }
}
