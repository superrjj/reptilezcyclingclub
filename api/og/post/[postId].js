import { createClient } from '@supabase/supabase-js';

const SITE_ORIGIN = 'https://reptilezcyclingclub.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/rcc_bg.jpg`;

// Keep in sync with `src/lib/supabase.js` (client). Prefer env vars if configured in Vercel.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://qrlqnmyrxsizdlnvyili.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybHFubXlyeHNpemRsbnZ5aWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTk2NzQsImV4cCI6MjA3OTg5NTY3NH0.ETrv8lkRGEe4WBaO1mF8koZQvIUEzs19oXQ4RaIgB2w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toAbsoluteImageUrl(maybeUrl) {
  if (!maybeUrl) return DEFAULT_IMAGE;
  const url = String(maybeUrl).trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function buildDescription(content) {
  if (!content) return 'Read the latest updates from D&R Reptilez Sports.';
  const plain = String(content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177)}...`;
}

export default async function handler(req, res) {
  const { postId } = req.query || {};

  if (!postId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><html><head><meta charset="utf-8" /><title>Bad Request</title></head><body>Missing postId</body></html>');
    return;
  }

  let post = null;
  try {
    const { data, error } = await supabase.from('posts').select('id,title,content,featured_image,created_at').eq('id', postId).single();
    if (!error) post = data;
  } catch (e) {
    // ignore; fall back to generic meta
  }

  const url = `${SITE_ORIGIN}/posts/${encodeURIComponent(postId)}`;
  const title = post?.title ? `${post.title} - D&R Reptilez Sports` : 'D&R Reptilez Sports';
  const description = buildDescription(post?.content);
  const image = toAbsoluteImageUrl(post?.featured_image);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(post?.title || 'D&R Reptilez Sports')}" />
    <meta property="og:site_name" content="D&R Reptilez Sports" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(url)}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body>
    <p>${post ? 'Loading…' : 'Post not found.'}</p>
  </body>
</html>`;

  res.statusCode = post ? 200 : 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache for crawlers, but keep it reasonably fresh.
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  res.end(html);
}


