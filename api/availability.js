import bookings from "../data/bookings.js";

function validBooking(item) {
  return item && /^\d{4}-\d{2}-\d{2}$/.test(item.arrival) && /^\d{4}-\d{2}-\d{2}$/.test(item.departure) && item.arrival < item.departure;
}

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
  }

  const periods = bookings.filter(validBooking).map(({ arrival, departure }) => ({ arrival, departure }));
  res.statusCode = 200;
  return res.end(JSON.stringify({ success: true, periods }));
}
