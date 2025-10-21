import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Remove any temporary debug logs if you added them
// console.log(`[db.js] NODE_ENV is: ${process.env.NODE_ENV}`); 

const dbConfig = {
  region: "us-east-1", // Make sure this matches the region of your live tables
};

// This logic correctly switches between local and live
if (process.env.NODE_ENV === "development") {
  console.log("Connecting to DynamoDB Local...");
  dbConfig.endpoint = "http://localhost:8000";
  dbConfig.credentials = {
    accessKeyId: "fakeKeyId", 
    secretAccessKey: "fakeSecretAccessKey",
  };
} else {
  // For production (on EC2), NODE_ENV will NOT be 'development'
  console.log("Connecting to live AWS DynamoDB...");
  // The SDK automatically finds credentials from the EC2 Instance's IAM Role.
  // No endpoint or credentials need to be specified here.
}

const client = new DynamoDBClient(dbConfig);
export const docClient = DynamoDBDocumentClient.from(client);