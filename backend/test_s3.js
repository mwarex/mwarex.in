require("dotenv").config();
const { S3Client, GetBucketLocationCommand } = require("@aws-sdk/client-s3");

async function checkRegion() {
  // Let's create a global client to check bucket location
  const s3 = new S3Client({
    region: "us-east-1", // You can ping us-east-1 to get location of any bucket
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  try {
    const data = await s3.send(new GetBucketLocationCommand({ Bucket: process.env.AWS_S3_BUCKET }));
    console.log("Bucket actual region is:", data.LocationConstraint || "us-east-1");
  } catch (err) {
    console.error("Error getting bucket location:", err.message);
  }
}
checkRegion();
