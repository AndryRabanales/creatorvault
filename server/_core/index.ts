import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth-providers";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import stripeWebhookRouter from "../stripe/webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

import { initScheduler } from "../scheduler";

async function startServer() {
  // Initialize background jobs
  initScheduler();

  const app = express();
  const server = createServer(app);

  // CORS configuration
  app.use((req, res, next) => {
    const allowedOrigins = [
      ENV.frontendUrl,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://creatorvault-woad.vercel.app",
      "https://creatorvault.vercel.app",
    ];

    const origin = req.headers.origin;

    // Allow same-origin requests (no Origin header) OR requests from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    next();
  });

  // Stripe webhook endpoint (MUST be registered BEFORE express.json middleware for raw body)
  app.use(stripeWebhookRouter);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint (before OAuth to avoid auth requirements)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: Date.now(),
      environment: ENV.nodeEnv,
      database: ENV.databaseUrl ? "configured" : "not configured",
      stripe: ENV.stripeSecretKey ? "configured" : "not configured",
      auth: ENV.auth0Domain ? "auth0" : ENV.clerkSecretKey ? "clerk" : ENV.oAuthServerUrl ? "manus" : "none",
    });
  });

  // Authentication routes (OAuth callback, etc.)
  registerAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static frontend files (ALWAYS in production, even if Vite setup exists)
  serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
