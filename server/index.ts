import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "net";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { validateEnvironment, logValidationResults } from "./validateEnv";
import passport from "passport";

// Validate environment variables
const envValidation = validateEnvironment();
logValidationResults(envValidation);

if (!envValidation.isValid) {
  console.error('\n❌ Cannot start server due to missing required environment variables.');
  console.error('Please check your .env file and ensure all required variables are set.\n');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Passport
app.use(passport.initialize());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Check if running in Vercel serverless environment
  if (process.env.VERCEL) {
    // In Vercel, just export the app, don't start a server
    log('✓ Running in Vercel serverless environment');
  } else {
    // Local development - start the server
    // Dynamic port allocation with conflict resolution
    const findAvailablePort = async (startPort: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        const testServer = createServer();
        
        testServer.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            // Port is in use, try the next one
            findAvailablePort(startPort + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
        
        testServer.on('listening', () => {
          const address = testServer.address();
          const port = typeof address === 'string' ? startPort : address?.port || startPort;
          testServer.close();
          resolve(port);
        });
        
        testServer.listen(startPort);
      });
    };

    const preferredPort = parseInt(process.env.PORT || '3000', 10);
    const port = await findAvailablePort(preferredPort);
    
    server.listen(port, '0.0.0.0', () => {
      log(`✓ Server running at http://localhost:${port}`);
      if (port !== preferredPort) {
        log(`  Note: Preferred port ${preferredPort} was in use, using port ${port} instead`);
      }
      log(`  API endpoint: http://localhost:${port}/api`);
    });
  }
})();

// Export the Express app for Vercel serverless
export default app;
