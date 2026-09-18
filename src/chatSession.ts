export interface Env {
  AI: Ai;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Keep your answers concise and conversational.";

export class ChatSession {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method === "DELETE") {
      await this.state.storage.deleteAll();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message } = (await request.json()) as { message: string };

    const history =
      (await this.state.storage.get<ChatMessage[]>("history")) ?? [];
    history.push({ role: "user", content: message });

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    const result = await this.env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      { messages }
    );

    const reply =
      (result as { response?: string }).response ??
      "Sorry, I couldn't come up with a response.";

    history.push({ role: "assistant", content: reply });
    await this.state.storage.put("history", history);

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
