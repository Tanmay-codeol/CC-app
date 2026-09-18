# CF AI Chat

Live at: https://cf-ai-chat.tanmaysharma0852.workers.dev

A small AI powered chat app built on Cloudflare. You type a message, it gets sent to Llama 3.3 running on Workers AI, and the reply shows up in the browser. Each conversation remembers its own history using a Durable Object, so the assistant has context from earlier messages in the same session.

## How it works

- **LLM**: Llama 3.3 (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) running on Cloudflare Workers AI.
- **Coordination**: a Cloudflare Worker handles requests and routes them to the right Durable Object.
- **Memory**: each chat session gets its own Durable Object instance, which stores the message history in its storage and passes it back to the model on every request so the conversation stays coherent.
- **Frontend**: a single static HTML page with plain JavaScript, served directly by the Worker. No framework, just a chat box and a send button.

## Project structure

```
public/index.html     the frontend
src/index.ts           worker entry point, routes requests
src/chatSession.ts      durable object that stores history and calls the model
wrangler.toml           cloudflare config
```

## Running it locally

You'll need a Cloudflare account and wrangler installed.

```
npm install
npm run dev
```

This starts a local dev server (wrangler will prompt you to log in the first time it needs to reach Workers AI). Open the URL it gives you and start chatting.

## Deploying

```
npm run deploy
```

This publishes the worker, the static assets, and sets up the Durable Object binding. After deploying, wrangler prints the URL where the app is live.

## Notes

Conversation history is kept per browser (a random session id is stored in localStorage), so opening the app in a different browser or clearing storage starts a fresh conversation. There's a reset button in the UI if you want to clear the current one manually.
