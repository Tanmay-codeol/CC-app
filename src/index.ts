export { ChatSession } from "./chatSession";

export interface Env {
  AI: Ai;
  ASSETS: Fetcher;
  CHAT_SESSION: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = (await request.json()) as {
        message?: string;
        sessionId?: string;
      };

      if (!body.message || !body.sessionId) {
        return new Response(
          JSON.stringify({ error: "message and sessionId are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const id = env.CHAT_SESSION.idFromName(body.sessionId);
      const stub = env.CHAT_SESSION.get(id);

      return stub.fetch("https://chat-session/message", {
        method: "POST",
        body: JSON.stringify({ message: body.message }),
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/reset" && request.method === "POST") {
      const body = (await request.json()) as { sessionId?: string };
      if (!body.sessionId) {
        return new Response(
          JSON.stringify({ error: "sessionId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const id = env.CHAT_SESSION.idFromName(body.sessionId);
      const stub = env.CHAT_SESSION.get(id);
      return stub.fetch("https://chat-session/message", { method: "DELETE" });
    }

    return env.ASSETS.fetch(request);
  },
};
