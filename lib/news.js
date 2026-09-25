export async function fetchNewsArticle(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=IN&ceid=IN:en`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const xml = await res.text();

  // Pull the first <item> block
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;
  const item = itemMatch[1];

  const clean = (s) =>
    s?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";

  const title = clean(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  const link = item.match(/<link>([\s\S]*?)<\/link>|<link\s*\/>/)?.[1]?.trim() ||
    item.match(/https?:\/\/[^\s<"]+/)?.[0] || "";
  const pubDate = clean(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]);
  const source = clean(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]);

  if (!title) return null;
  return { title, link, pubDate, source };
}
