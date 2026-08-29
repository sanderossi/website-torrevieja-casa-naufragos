import tls from "node:tls";

const GMAIL_USER = process.env.GMAIL_USER || "sanderossi@gmail.com";
const RECIPIENTS = ["hayatie@hotmail.com", "sander@webstate.nl"];

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
}
function safeHeader(value) { return String(value).replace(/[\r\n]+/g, " ").trim(); }
function encodeHeader(value) { return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`; }
function validate(body) {
  if (!body || typeof body !== "object") throw new Error("Invalid request");
  const arrival = String(body.arrival ?? "").trim();
  const departure = String(body.departure ?? "").trim();
  const nights = Number(body.nights);
  const guests = String(body.guests ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const lang = String(body.lang ?? "en");
  if (!arrival || !departure || !Number.isInteger(nights) || nights < 1) throw new Error("Invalid dates");
  if (!guests || guests.length > 10) throw new Error("Invalid guests");
  if (!name || name.length > 120) throw new Error("Invalid name");
  if (!isEmail(email)) throw new Error("Invalid email");
  if (message.length > 2000) throw new Error("Message too long");
  if (!["en","nl","es","fr"].includes(lang)) throw new Error("Invalid language");
  return { arrival, departure, nights, guests, name, email, message, lang };
}
function buildMessage(input) {
  const langNames = { en:"Engels", nl:"Nederlands", es:"Spaans", fr:"Frans" };
  const subject = `Aanvraag Casa Náufragos: ${input.arrival} → ${input.departure} (${input.name})`;
  const text = [
    "Nieuwe beschikbaarheidsaanvraag — Casa Náufragos", "",
    `Aankomst:        ${input.arrival}`, `Vertrek:         ${input.departure}`,
    `Aantal nachten:  ${input.nights}`, `Aantal personen: ${input.guests}`,
    `Naam:            ${input.name}`, `E-mail:          ${input.email}`,
    `Taal website:    ${langNames[input.lang] ?? input.lang}`, "",
    input.message ? `Bericht van de aanvrager:\n${input.message}` : "(geen bericht meegegeven)", "",
    "— Verstuurd vanaf het contactformulier op Casa Náufragos"
  ].join("\n");
  const headers = [
    `From: Casa Náufragos <${GMAIL_USER}>`, `To: ${RECIPIENTS.join(", ")}`,
    `Reply-To: ${safeHeader(input.name)} <${safeHeader(input.email)}>`,
    `Subject: ${encodeHeader(subject)}`, "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64",
    `Date: ${new Date().toUTCString()}`, `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@casa-naufragos>`
  ];
  return `${headers.join("\r\n")}\r\n\r\n${Buffer.from(text,"utf8").toString("base64").replace(/(.{76})/g,"$1\r\n")}\r\n`;
}
function smtpSend(message, appPassword) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, "smtp.gmail.com", { servername:"smtp.gmail.com" });
    socket.setEncoding("utf8"); socket.setTimeout(15000);
    let buffer="", stage=0, authStep=0, done=false;
    const fail = err => { if (done) return; done=true; socket.destroy(); reject(err); };
    const send = line => socket.write(`${line}\r\n`);
    socket.on("timeout",()=>fail(new Error("SMTP timeout"))); socket.on("error",fail);
    socket.on("data", chunk => {
      buffer += chunk; const lines=buffer.split(/\r?\n/); buffer=lines.pop() ?? "";
      for (const line of lines) {
        if (!/^\d{3}[ -]/.test(line) || line[3] === "-") continue;
        const code=Number(line.slice(0,3)); if (code>=400) return fail(new Error(`SMTP ${code}: ${line.slice(4)}`));
        try {
          if (stage===0 && code===220) {stage=1;send("EHLO casa-naufragos");}
          else if (stage===1 && code===250) {stage=2;send("AUTH LOGIN");}
          else if (stage===2 && code===334) {
            if (authStep===0) {authStep=1;send(Buffer.from(GMAIL_USER).toString("base64"));}
            else {stage=3;send(Buffer.from(appPassword.replace(/\s+/g,"")).toString("base64"));}
          }
          else if (stage===3 && code===235) {stage=4;send(`MAIL FROM:<${GMAIL_USER}>`);}
          else if (stage===4 && code===250) {stage=5;send(`RCPT TO:<${RECIPIENTS[0]}>`);}
          else if (stage===5 && code===250) {stage=6;send(`RCPT TO:<${RECIPIENTS[1]}>`);}
          else if (stage===6 && code===250) {stage=7;send("DATA");}
          else if (stage===7 && code===354) {stage=8;socket.write(`${message.replace(/^\./gm,"..")}\r\n.\r\n`);}
          else if (stage===8 && code===250) {stage=9;send("QUIT");}
          else if (stage===9 && code===221) {if(done)return;done=true;socket.end();resolve();}
        } catch(e) { fail(e instanceof Error ? e : new Error(String(e))); }
      }
    });
  });
}
async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks=[]; for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
  const raw=Buffer.concat(chunks).toString("utf8"); return raw ? JSON.parse(raw) : {};
}
export default async function handler(req,res) {
  res.setHeader("Content-Type","application/json; charset=utf-8");
  if (req.method!=="POST") {res.statusCode=405;res.setHeader("Allow","POST");return res.end(JSON.stringify({success:false,error:"Method not allowed"}));}
  try {
    const appPassword=process.env.GMAIL_APP_PASSWORD; if(!appPassword) throw new Error("GMAIL_APP_PASSWORD is not configured");
    const input=validate(await readJson(req)); await smtpSend(buildMessage(input),appPassword);
    res.statusCode=200; return res.end(JSON.stringify({success:true}));
  } catch(error) { console.error("Inquiry send failed",error); res.statusCode=500; return res.end(JSON.stringify({success:false})); }
}
