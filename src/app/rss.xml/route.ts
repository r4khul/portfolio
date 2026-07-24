import { profile } from "@/data/profile";
import { getBlogs } from "@/lib/blogs";
import { getStories } from "@/lib/stories";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = profile.url.replace(/\/$/, "");

  const blogs = getBlogs().map((blog) => ({
    title: blog.title,
    description: blog.description,
    link: `${baseUrl}/blogs/${blog.slug}`,
    pubDate: new Date(blog.date).toUTCString(),
    category: blog.category || "Blog",
  }));

  const stories = getStories().map((story) => ({
    title: story.title,
    description: story.description,
    link: `${baseUrl}/stories/${story.slug}`,
    pubDate: new Date(story.date).toUTCString(),
    category: story.category || "Story",
  }));

  const allItems = [...blogs, ...stories].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  const rssItemsXml = allItems
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <category>${escapeXml(item.category)}</category>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(profile.name)} - Blogs &amp; Stories</title>
    <link>${baseUrl}</link>
    <description>Latest articles, engineering insights, and creative stories by ${escapeXml(profile.name)}.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
