import type { IncomingRequestCfProperties } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { anonymous } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "../db";
import type { CloudflareBindings } from "../env";

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(env?: CloudflareBindings, cf?: IncomingRequestCfProperties) {
    console.log("createAuth called with env:", env);

    // Create postgres-js connection using Hyperdrive binding
    const db = env ? drizzle(postgres(env.DATABASE.connectionString), { schema, logger: true }) : ({} as any);

    return betterAuth({
        ...withCloudflare(
            {
                autoDetectIpAddress: true,
                geolocationTracking: true,
                cf: cf || {},
                postgres: {
                    db,
                },
                kv: env?.KV,
            },
            {
                emailAndPassword: {
                    enabled: true,
                },
                plugins: [anonymous()],
                rateLimit: {
                    enabled: true,
                },
            }
        ),
    });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };
