import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//.test(url))
      return res.status(400).json({ error: "Invalid or missing URL" });

    const encodedUrl = encodeURIComponent(url);
    const target = `https://teradownloadr.com/?url=${encodedUrl}`;
    const response = await fetch(target);
    const html = await response.text();

    const $ = cheerio.load(html);
    const files = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href && href.startsWith("http")) {
        const parts = text.split("/");
        const folder = parts.length > 1 ? parts[0] : "Root";
        const name = parts.at(-1);
        files.push({ folder, name, downloadUrl: href });
      }
    });

    const grouped = {};
    for (const f of files) {
      if (!grouped[f.folder]) grouped[f.folder] = [];
      grouped[f.folder].push({ name: f.name, url: f.downloadUrl });
    }

    const isFolder = Object.keys(grouped).length > 1 || (grouped["Root"]?.length ?? 0) > 1;

    return res.status(200).json({ isFolder, structure: grouped });
  } catch (err) {
    console.error("Extract error:", err);
    return res.status(500).json({ error: "Failed to fetch or parse" });
  }
}
