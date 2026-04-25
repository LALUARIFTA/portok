export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy logic for AI Chat
    if (url.pathname === "/api/ai/chat/completions" && request.method === "POST") {
      try {
        const body = await request.json();
        const apiKey = env.VITE_NVIDIA_API_KEY;

        if (!apiKey) {
          return new Response(JSON.stringify({ message: "NVIDIA API Key not configured in Cloudflare Dashboard (Variables)." }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "text/event-stream"
          },
          body: JSON.stringify(body)
        });

        if (!nvidiaResponse.ok) {
          const errorData = await nvidiaResponse.json().catch(() => ({}));
          return new Response(JSON.stringify({ 
            message: errorData.detail || errorData.message || `NVIDIA API Error: ${nvidiaResponse.status}` 
          }), { 
            status: nvidiaResponse.status,
            headers: { "Content-Type": "application/json" }
          });
        }

        return new Response(nvidiaResponse.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ message: `Worker Error: ${err.message}` }), { 
          status: 500, 
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  }
};
