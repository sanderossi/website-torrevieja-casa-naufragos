export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN missing' });
  try {
    const response = await fetch('https://blob.vercel-storage.com/?limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    const blobs = Array.isArray(data?.blobs) ? data.blobs : [];
    const mp4s = blobs.filter(item => String(item.pathname || '').toLowerCase().endsWith('.mp4'));
    return res.status(response.ok ? 200 : response.status).json({ mp4s });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
}
