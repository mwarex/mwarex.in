const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_S3_BUCKET;
async function getPresignedUploadUrl({ key, contentType, maxSizeBytes }) {
    const { url, fields } = await createPresignedPost(s3, {
        Bucket: BUCKET,
        Key: key,
        Conditions: [
            ["content-length-range", 0, maxSizeBytes || 10 * 1024 * 1024 * 1024], // default 10 GB
            ["eq", "$Content-Type", contentType],
        ],
        Fields: {
            "Content-Type": contentType,
        },
        Expires: 3600,  
    });

    return { url, fields };
}

 
async function getS3ReadStream(key) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const response = await s3.send(command);
    return { stream: response.Body, contentLength: response.ContentLength };
}

 
async function deleteS3Object(key) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
 
async function getSignedDownloadUrl(key) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn: 7 * 24 * 3600 });
}

module.exports = { getPresignedUploadUrl, getS3ReadStream, deleteS3Object, getSignedDownloadUrl };
