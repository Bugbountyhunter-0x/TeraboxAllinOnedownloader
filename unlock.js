export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//.test(url))
      return res.status(400).json({ error: "Invalid URL" });

    // Simulate ad watch delay (10 seconds)
    await new Promise((r) => setTimeout(r, 10000));

    return res.status(200).json({
      status: "unlocked",
      downloadUrl: url,
      message: "Ad watched successfully. Download ready!"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}