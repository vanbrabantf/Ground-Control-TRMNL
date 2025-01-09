import { getSnapshot } from "./data/datastreamer.ts";

async function fetchSnapshot() {
  try {
    return await getSnapshot();
  } catch (error) {
    console.error("Error fetching snapshot:", error);
    return { error: "Failed to fetch snapshot" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "GET" && new URL(req.url).pathname === "/snapshot") {
    const snapshot = await fetchSnapshot();
    const responseBody = JSON.stringify(snapshot, null, 2);

    return new Response(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Hello world", { status: 200 });
});
