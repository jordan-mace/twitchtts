import { PollyClient } from "@aws-sdk/client-polly";

const {
  VITE_AWS_REGION,
  VITE_AWS_ACCESS_KEY,
  VITE_AWS_SECRET_KEY,
} = import.meta.env;

export const { VITE_BUILD_ID } = import.meta.env;

if (!VITE_AWS_REGION || !VITE_AWS_ACCESS_KEY || !VITE_AWS_SECRET_KEY) {

  if (!VITE_AWS_REGION) {
    console.error("VITE_AWS_REGION is not set.");
  }
  if (!VITE_AWS_ACCESS_KEY) {
    console.error("VITE_AWS_ACCESS_KEY is not set.");
  }
  if (!VITE_AWS_SECRET_KEY) {
    console.error("VITE_AWS_SECRET_KEY is not set.");
  }

  throw new Error(
    "Missing AWS credentials. Please set VITE_AWS_REGION, VITE_AWS_ACCESS_KEY, and VITE_AWS_SECRET_KEY in your environment variables."
  );
}

// Create an Amazon S3 service client object.
export const pollyClient = new PollyClient({
  region: VITE_AWS_REGION,
  credentials: {
    accessKeyId: VITE_AWS_ACCESS_KEY,
    secretAccessKey: VITE_AWS_SECRET_KEY
  },
});