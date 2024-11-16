import { PollyClient } from "@aws-sdk/client-polly";

const {
    REACT_APP_AWS_REGION,
    REACT_APP_AWS_ACCESS_KEY,
    REACT_APP_AWS_SECRET_KEY,
  } = process.env;
  
  // Create an Amazon S3 service client object.
export const pollyClient = new PollyClient({
    region: REACT_APP_AWS_REGION,
    credentials: {
      accessKeyId: REACT_APP_AWS_ACCESS_KEY ? REACT_APP_AWS_ACCESS_KEY : "",
      secretAccessKey: REACT_APP_AWS_SECRET_KEY ? REACT_APP_AWS_SECRET_KEY : "",
    },
  });