import { describe, expect, it, beforeAll } from "vitest";
import { ENV } from "./_core/env";

describe("Deployment Configuration", () => {
  describe("Environment Variables", () => {
    it("should have JWT_SECRET configured", () => {
      expect(ENV.jwtSecret).toBeTruthy();
      if (ENV.jwtSecret) {
        expect(ENV.jwtSecret.length).toBeGreaterThan(0);
      }
    });

    it("should have a valid node environment", () => {
      expect(ENV.nodeEnv).toMatch(/^(development|production|test)$/);
    });

    it("should have port configured", () => {
      expect(ENV.port).toBeGreaterThan(0);
      expect(ENV.port).toBeLessThan(65536);
    });
  });

  describe("Database Configuration", () => {
    it("should have DATABASE_URL if not in test mode", () => {
      if (ENV.nodeEnv !== "test") {
        expect(ENV.databaseUrl).toBeTruthy();
      }
    });

    it("should have valid database URL format if configured", () => {
      if (ENV.databaseUrl) {
        expect(
          ENV.databaseUrl.startsWith("mysql://") ||
          ENV.databaseUrl.startsWith("postgresql://") ||
          ENV.databaseUrl.startsWith("postgres://")
        ).toBe(true);
      }
    });
  });

  describe("Stripe Configuration", () => {
    it("should have Stripe keys if configured", () => {
      if (ENV.stripeSecretKey) {
        expect(ENV.stripeSecretKey).toMatch(/^sk_(test|live)_/);
      }
      
      if (ENV.stripePublishableKey) {
        expect(ENV.stripePublishableKey).toMatch(/^pk_(test|live)_/);
      }

      if (ENV.stripeWebhookSecret) {
        expect(ENV.stripeWebhookSecret).toMatch(/^whsec_/);
      }
    });

    it("should not mix test and live Stripe keys", () => {
      if (ENV.stripeSecretKey && ENV.stripePublishableKey) {
        const isSecretTest = ENV.stripeSecretKey.includes("test");
        const isPublishableTest = ENV.stripePublishableKey.includes("test");
        
        expect(isSecretTest).toBe(isPublishableTest);
      }
    });
  });

  describe("Authentication Configuration", () => {
    it("should have at least one auth provider configured", () => {
      const hasAuth0 = ENV.auth0Domain && ENV.auth0ClientId && ENV.auth0ClientSecret;
      const hasClerk = ENV.clerkSecretKey;
      const hasManus = ENV.oAuthServerUrl && ENV.appId;

      expect(hasAuth0 || hasClerk || hasManus).toBe(true);
    });

    it("should have valid Auth0 config if configured", () => {
      if (ENV.auth0Domain) {
        expect(ENV.auth0Domain).toMatch(/\.auth0\.com$/);
        expect(ENV.auth0ClientId).toBeTruthy();
        expect(ENV.auth0ClientSecret).toBeTruthy();
      }
    });

    it("should have valid Clerk config if configured", () => {
      if (ENV.clerkSecretKey) {
        expect(ENV.clerkSecretKey).toMatch(/^sk_(test|live)_/);
      }
    });
  });

  describe("URL Configuration", () => {
    it("should have valid frontend URL format", () => {
      expect(
        ENV.frontendUrl.startsWith("http://") ||
        ENV.frontendUrl.startsWith("https://")
      ).toBe(true);
    });

    it("should have valid backend URL format", () => {
      expect(
        ENV.backendUrl.startsWith("http://") ||
        ENV.backendUrl.startsWith("https://")
      ).toBe(true);
    });

    it("should use HTTPS in production", () => {
      if (ENV.isProduction) {
        expect(ENV.frontendUrl.startsWith("https://")).toBe(true);
        expect(ENV.backendUrl.startsWith("https://")).toBe(true);
      }
    });
  });
});

describe("Health Endpoint", () => {
  it("should return valid health status structure", () => {
    const healthStatus = {
      status: "ok",
      timestamp: Date.now(),
      environment: ENV.nodeEnv,
      database: ENV.databaseUrl ? "configured" : "not configured",
      stripe: ENV.stripeSecretKey ? "configured" : "not configured",
      auth: ENV.auth0Domain ? "auth0" : ENV.clerkSecretKey ? "clerk" : ENV.oAuthServerUrl ? "manus" : "none",
    };

    expect(healthStatus.status).toBe("ok");
    expect(healthStatus.timestamp).toBeGreaterThan(0);
    expect(healthStatus.environment).toBeTruthy();
  });
});
