import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS: restrictive in production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [];
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? (allowedOrigins.length ? allowedOrigins : false)
    : "*",
  credentials: true,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const leadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many lead submissions." },
});

app.use("/api/", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Admin token auth for protected routes
function requireAdminToken(req, res, next) {
  const token = req.headers["x-admin-token"];
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

// Ensure directories exist
const dataDir = "./data";
const publicDir = "./public";

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Initialize JSON files if missing
const leadsFile = join(dataDir, "leads.json");
if (!existsSync(leadsFile)) writeFileSync(leadsFile, JSON.stringify({ leads: [] }, null, 2));

const siteConfigFile = join(publicDir, "site.config.json");
if (!existsSync(siteConfigFile)) {
  writeFileSync(siteConfigFile, JSON.stringify({
    siteName: "SmartFlow",
    theme: "dark",
    version: "0.1.0"
  }, null, 2));
}

const pricingFile = join(publicDir, "pricing.json");
if (!existsSync(pricingFile)) writeFileSync(pricingFile, JSON.stringify({ plans: [] }, null, 2));

const config = JSON.parse(readFileSync(siteConfigFile, "utf-8"));

function readLeads() {
  try {
    const data = readFileSync(leadsFile, "utf-8");
    return JSON.parse(data);
  } catch {
    console.error("Error reading leads file");
    return { leads: [] };
  }
}

function writeLeads(data) {
  try {
    writeFileSync(leadsFile, JSON.stringify(data, null, 2));
    return true;
  } catch {
    console.error("Error writing leads file");
    return false;
  }
}

// Serve static files
app.use(express.static(publicDir));

// Health checks
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// POST /api/leads
app.post("/api/leads", leadsLimiter, (req, res) => {
  try {
    const { firstName, lastName, email, company, phone, source } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: "First name, last name, and email are required" });
    }

    if (
      typeof firstName !== "string" || firstName.length > 100 ||
      typeof lastName !== "string" || lastName.length > 100 ||
      typeof email !== "string" || email.length > 254
    ) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const data = readLeads();
    const existingLead = data.leads.find(lead => lead.email === email);
    if (existingLead) {
      return res.status(200).json({ success: true, message: "Lead already exists", leadId: existingLead.id });
    }

    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName, lastName, email,
      company: company || "", phone: phone || "", source: source || "direct",
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.leads.push(newLead);
    if (!writeLeads(data)) throw new Error("Failed to save lead");
    console.log("New lead captured");

    res.status(201).json({ success: true, message: "Lead captured successfully", leadId: newLead.id });
  } catch {
    console.error("Lead submission error");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/leads — requires admin token
app.get("/api/leads", requireAdminToken, (_req, res) => {
  try {
    const data = readLeads();
    res.json({ success: true, count: data.leads.length, leads: data.leads });
  } catch {
    console.error("Error fetching leads");
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
});

// POST /api/stripe/checkout
app.post("/api/stripe/checkout", (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || typeof planId !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(planId)) {
      return res.status(400).json({ success: false, message: "Invalid plan ID" });
    }

    const pricingData = JSON.parse(readFileSync(pricingFile, "utf-8"));
    const plan = pricingData.plans.find(p => p.id === planId);

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    res.json({
      success: true,
      message: "Stripe integration pending",
      planId,
      plan: plan.name,
      price: plan.price,
      url: `/contact.html?plan=${encodeURIComponent(planId)}`
    });
  } catch {
    console.error("Checkout error");
    res.status(500).json({ success: false, message: "Failed to create checkout session" });
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: "Internal server error" });
});

// Port auto-switching
const DEFAULT_PORT = parseInt(process.env.PORT || "5000", 10);

async function findFreePort(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once("error", () => resolve(findFreePort(port + 1)))
      .once("listening", () => tester.close(() => resolve(port)))
      .listen(port);
  });
}

(async () => {
  const port = await findFreePort(DEFAULT_PORT);
  app.listen(port, () => console.log(`serving on ${port}`));
})();

export default app;
