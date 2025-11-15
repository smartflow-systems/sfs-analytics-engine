import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use ws for WebSocket connections
neonConfig.webSocketConstructor = ws;

// Use an in-memory database for development if no DATABASE_URL is set
const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/analytics";

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
