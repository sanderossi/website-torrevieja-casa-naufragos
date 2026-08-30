import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  try {
    const found = [];
    let cursor;
    do {
      const page = await list({ limit: 1000, cursor });
      for (const blob of page.blobs || []) {
        if (/\.mp4$/i.test(blob.pathname || '')) {
          found.push({
            pathname: blob.pathname,
            url: blob.url,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            contentType: blob.contentType || null
          });
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    found.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, blobs: found }));
  } catch (error) {
    console.error('Blob discovery failed', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, error: 'Blob discovery failed' }));
  }
}
