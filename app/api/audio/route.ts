import { handleMediaRequest } from "@/lib/openai-media";

export const runtime = "nodejs";
export const maxDuration = 70;

export async function POST(request: Request) {
  return handleMediaRequest(request, "audio");
}
