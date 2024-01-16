import { z } from 'zod';

// Define necessary environment variables here.
const environmentSchema = z.object({
  SMARTSHEET_API_TOKEN: z.string(),
});

const safeParsedEnv = environmentSchema.safeParse(process.env);
if (!safeParsedEnv.success) {
  throw new Error(safeParsedEnv.error.message);
}
type EnvironmentType = z.infer<typeof environmentSchema>;

/**
 * Represents the environment type of the server. These values should not expose to the client.
 */
export const ServerEnvironment: EnvironmentType = safeParsedEnv.data;
