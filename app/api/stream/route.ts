import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addClient(controller);

      // Send initial connection message
      controller.enqueue(encoder.encode("data: {\"connected\":true}\n\n"));

      // Send keepalive every 30 seconds
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepalive);
          removeClient(controller);
        }
      }, 30000);

      // Clean up when the connection is closed
      req.signal.addEventListener("abort", () => {
        clearInterval(keepalive);
        removeClient(controller);
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      });
    },
    cancel() {
      // Stream was cancelled by the client
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
