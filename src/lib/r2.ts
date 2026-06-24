import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function uploadVideo(key: string, body: Buffer | Uint8Array | Blob, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `videos/${key}`,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return `videos/${key}`;
}

export async function getVideoUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `videos/${key}`,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function listVideos(prefix = "videos/") {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  });

  const response = await r2Client.send(command);
  return response.Contents ?? [];
}
