const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const helmet = require("helmet");
const axios = require("axios");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, "data");
const STATIONS_FILE = path.join(DATA_DIR, "stations.json");
const TRAINS_FILE = path.join(DATA_DIR, "trains.json");

function readJsonFile(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (_e) {
    return fallback;
  }
}

const stations = readJsonFile(STATIONS_FILE, []);
const trains = readJsonFile(TRAINS_FILE, []);

const stationByCode = new Map();
for (const station of stations) {
  stationByCode.set(String(station.stationCode).toUpperCase(), station);
}

const normalizedStationIndex = stations.map((station) => {
  const code = String(station.stationCode || "").toUpperCase();
  const name = String(station.stationName || "");
  const city = String(station.city || "");
  const state = String(station.state || "");
  const searchText = `${name} ${code} ${city} ${state}`.toUpperCase();
  return { station, code, nameUpper: name.toUpperCase(), searchText };
});

const trainByNumber = new Map();
for (const train of trains) {
  trainByNumber.set(String(train.trainNumber), train);
}

function normalizeMobile(rawMobile) {
  const digits = String(rawMobile || "").replace(/\D/g, "");

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (String(rawMobile || "").startsWith("+") && digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function getDayName(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return null;
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[date.getDay()];
}

function seededNumber(seedText, max) {
  const hash = crypto.createHash("sha256").update(seedText).digest("hex");
  const n = parseInt(hash.slice(0, 8), 16);
  return n % max;
}

function getAvailabilityForClass(trainNumber, dateText, classCode) {
  const seed = `${trainNumber}|${dateText}|${classCode}`;
  const roll = seededNumber(seed, 100);

  if (roll < 62) {
    return { status: "Available", count: 8 + seededNumber(`${seed}:a`, 120) };
  }

  if (roll < 80) {
    return { status: "RAC", count: 1 + seededNumber(`${seed}:r`, 12) };
  }

  return { status: "Waiting List", count: 1 + seededNumber(`${seed}:w`, 45) };
}

function serializeTrainResult(train, dateText, quotaText) {
  const availability = {};
  for (const classCode of train.availableClasses || []) {
    const base = getAvailabilityForClass(train.trainNumber, dateText, classCode);
    if (String(quotaText || "").toUpperCase() === "TATKAL") {
      if (base.status === "Available") {
        availability[classCode] = { status: "Available", count: Math.max(1, Math.ceil(base.count * 0.35)) };
      } else {
        availability[classCode] = base;
      }
    } else {
      availability[classCode] = base;
    }
  }

  const fromStation = stationByCode.get(String(train.fromStation || "").toUpperCase());
  const toStation = stationByCode.get(String(train.toStation || "").toUpperCase());

  return {
    trainName: train.trainName,
    trainNumber: train.trainNumber,
    fromStation: train.fromStation,
    toStation: train.toStation,
    fromStationName: fromStation ? fromStation.stationName : train.fromStation,
    toStationName: toStation ? toStation.stationName : train.toStation,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    travelDuration: train.travelDuration,
    runningDays: train.runningDays || [],
    distanceKm: train.distanceKm,
    trainType: train.trainType,
    availableClasses: train.availableClasses || [],
    baseFares: train.baseFares || {},
    seatAvailability: availability,
    quota: quotaText || "General"
  };
}

app.get("/api/meta", (_req, res) => {
  res.json({
    ok: true,
    stationsCount: stations.length,
    trainsCount: trains.length
  });
});

app.get("/api/stations/search", (req, res) => {
  const q = String(req.query.q || "").trim().toUpperCase();
  const limit = Math.min(Number(req.query.limit || 10), 20);

  if (!q) {
    return res.json({ ok: true, results: [] });
  }

  const scored = [];
  for (const row of normalizedStationIndex) {
    let score = 0;

    if (row.code === q) {
      score = 300;
    } else if (row.code.startsWith(q)) {
      score = 250;
    } else if (row.nameUpper.startsWith(q)) {
      score = 200;
    } else if (row.searchText.includes(q)) {
      score = 100;
    }

    if (score > 0) {
      scored.push({ score, station: row.station });
    }
  }

  scored.sort((a, b) => b.score - a.score || String(a.station.stationName).localeCompare(String(b.station.stationName)));

  return res.json({
    ok: true,
    results: scored.slice(0, limit).map((item) => item.station)
  });
});

app.get("/api/stations/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const station = stationByCode.get(code);
  if (!station) {
    return res.status(404).json({ ok: false, error: "Station not found." });
  }

  return res.json({ ok: true, station });
});

app.get("/api/trains/search", (req, res) => {
  const from = String(req.query.from || "").toUpperCase();
  const to = String(req.query.to || "").toUpperCase();
  const date = String(req.query.date || "");
  const classCode = String(req.query.class || "").toUpperCase();
  const quota = String(req.query.quota || "General");

  if (!from || !to || !date) {
    return res.status(400).json({ ok: false, error: "from, to, and date are required." });
  }

  const dayName = getDayName(date);
  if (!dayName) {
    return res.status(400).json({ ok: false, error: "Invalid travel date." });
  }

  const filtered = trains.filter((train) => {
    if (String(train.fromStation).toUpperCase() !== from) return false;
    if (String(train.toStation).toUpperCase() !== to) return false;

    const running = Array.isArray(train.runningDays) ? train.runningDays : [];
    if (!running.includes(dayName)) return false;

    if (classCode && Array.isArray(train.availableClasses) && !train.availableClasses.includes(classCode)) {
      return false;
    }

    return true;
  });

  const results = filtered.map((train) => serializeTrainResult(train, date, quota));

  return res.json({
    ok: true,
    date,
    day: dayName,
    count: results.length,
    quota,
    results
  });
});

app.get("/api/trains/:number", (req, res) => {
  const number = String(req.params.number || "");
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  const train = trainByNumber.get(number);

  if (!train) {
    return res.status(404).json({ ok: false, error: "Train not found." });
  }

  return res.json({ ok: true, train: serializeTrainResult(train, date, "General") });
});

const OTP_TTL_MS = 5 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 30 * 1000;
const REQUEST_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const otpStore = new Map();

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function safeEqualHex(left, right) {
  try {
    const a = Buffer.from(left, "hex");
    const b = Buffer.from(right, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (_e) {
    return false;
  }
}

function getSmsProvider() {
  return (process.env.SMS_PROVIDER || "twilio").trim().toLowerCase();
}

async function sendViaTwilio(to, message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    throw new Error("Twilio config missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.");
  }

  const client = twilio(sid, token);
  await client.messages.create({ to, from, body: message });
}

async function sendViaMsg91(to, message) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const sender = process.env.MSG91_SENDER_ID;
  const route = process.env.MSG91_ROUTE || "4";
  const country = process.env.MSG91_COUNTRY || "91";

  if (!authKey || !sender) {
    throw new Error("MSG91 config missing. Set MSG91_AUTH_KEY and MSG91_SENDER_ID.");
  }

  const mobileDigits = to.replace(/\D/g, "").replace(/^91/, "");

  await axios.post(
    "https://api.msg91.com/api/v2/sendsms",
    {
      sender,
      route,
      country,
      sms: [
        {
          message,
          to: [mobileDigits]
        }
      ]
    },
    {
      headers: {
        authkey: authKey,
        "content-type": "application/json"
      },
      timeout: 10000
    }
  );
}

async function sendOtpSms(to, otp) {
  const message = `Your RailSwift login OTP is ${otp}. Do not share this code.`;
  const provider = getSmsProvider();

  if (provider === "twilio") {
    await sendViaTwilio(to, message);
    return;
  }

  if (provider === "msg91") {
    await sendViaMsg91(to, message);
    return;
  }

  throw new Error("Unsupported SMS_PROVIDER. Use twilio or msg91.");
}

function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [mobile, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(mobile);
    }
  }
}

setInterval(cleanupExpiredOtps, 60 * 1000).unref();

app.post("/send-otp", async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);

  if (!mobile) {
    return res.status(400).json({ ok: false, error: "Invalid mobile number." });
  }

  const now = Date.now();
  const previous = otpStore.get(mobile);

  if (previous) {
    if (previous.lastSentAt && now - previous.lastSentAt < REQUEST_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((REQUEST_COOLDOWN_MS - (now - previous.lastSentAt)) / 1000);
      return res.status(429).json({ ok: false, error: `Please wait ${waitSeconds}s before requesting another OTP.` });
    }

    if (now - previous.windowStartedAt > REQUEST_WINDOW_MS) {
      previous.requestCount = 0;
      previous.windowStartedAt = now;
    }

    if (previous.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ ok: false, error: "OTP request limit reached. Try again later." });
    }
  }

  const otp = generateOtp();

  try {
    await sendOtpSms(mobile, otp);
  } catch (error) {
    if (String(process.env.ALLOW_CONSOLE_OTP || "false").toLowerCase() === "true") {
      console.log(`[DEV OTP] ${mobile}: ${otp}`);
    } else {
      return res.status(500).json({ ok: false, error: `Failed to send OTP: ${error.message}` });
    }
  }

  const record = previous || {
    requestCount: 0,
    windowStartedAt: now
  };

  record.otpHash = hashOtp(otp);
  record.createdAt = now;
  record.expiresAt = now + OTP_TTL_MS;
  record.lastSentAt = now;
  record.requestCount += 1;
  record.verifyAttempts = 0;
  otpStore.set(mobile, record);

  return res.json({ ok: true, message: "OTP sent successfully." });
});

app.post("/verify-otp", (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  const otp = String(req.body.otp || "").trim();

  if (!mobile || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ ok: false, error: "Invalid mobile number or OTP format." });
  }

  const record = otpStore.get(mobile);
  if (!record) {
    return res.status(400).json({ ok: false, error: "OTP not found. Request a new OTP." });
  }

  const now = Date.now();
  if (record.expiresAt < now) {
    otpStore.delete(mobile);
    return res.status(400).json({ ok: false, error: "OTP expired. Request a new OTP." });
  }

  if (record.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(mobile);
    return res.status(429).json({ ok: false, error: "Too many failed attempts. Request a new OTP." });
  }

  const isValid = safeEqualHex(hashOtp(otp), record.otpHash);
  if (!isValid) {
    record.verifyAttempts += 1;
    otpStore.set(mobile, record);
    return res.status(400).json({ ok: false, error: "Incorrect OTP." });
  }

  otpStore.delete(mobile);
  return res.json({ ok: true, message: "OTP verified successfully." });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "railswift-server",
    stations: stations.length,
    trains: trains.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`RailSwift server running at http://localhost:${PORT}`);
  console.log(`Loaded stations: ${stations.length}, trains: ${trains.length}`);
});




