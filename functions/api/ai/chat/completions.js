export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const apiKey = env.VITE_NVIDIA_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "NVIDIA API Key is not configured in Cloudflare environment variables." }), { 
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

    // Create a new response from the NVIDIA response body to pass through the stream
    const { readable, writable } = new TransformStream();
    nvidiaResponse.body.pipeTo(writable);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Handle OPTIONS for CORS if necessary (though same-origin should be fine)
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
