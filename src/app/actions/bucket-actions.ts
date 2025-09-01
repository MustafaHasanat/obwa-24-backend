"use server";

import { AWS_BUCKET_URL } from "@/constants";
import { BucketFileType, BucketPath } from "@/enums";
import { FileObject } from "@/types";
import {
  customJoin,
  getAwsConfiguration,
  getAwsFileUrl,
  getOriginalUrlFromPresignedUrl,
} from "@/utils";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadAssetToBucketProps {
  fileObject: FileObject;
  bucketPath: BucketPath;
  type: BucketFileType;
  identifier: string; // userId or businessId
}

export async function uploadAssetToBucket({
  fileObject,
  bucketPath,
  type,
  identifier,
}: UploadAssetToBucketProps): Promise<string | null> {
  try {
    if (!bucketPath || !fileObject || !fileObject?.file || !type || !identifier)
      throw new Error(
        "Error uploading the image/file, one of the required attributes is missing."
      );

    const refinedPath = customJoin(bucketPath, identifier, type);
    const fileName = `${Date.now()}_${fileObject?.file?.name}`;
    const key = customJoin(refinedPath, fileName);

    const { s3Client, bucketName } = await getAwsConfiguration({
      accessKeyId: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_SECRET || "",
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileObject?.file?.type,
      ACL: "public-read",
    });

    // crete a special temporary URL to upload the file on it
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    // upload the file on the DO bucket
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileObject?.file.type,
      },
      body: fileObject?.file,
    });

    const publicUrl = `https://${bucketName}.${process.env.DIGITAL_OCEAN_SPACE_REGION}.digitaloceanspaces.com/${key}`;

    if (!response?.ok || !response?.url) return null;

    return publicUrl;
  } catch (error) {
    console.error(error);
    return "";
  }
}

interface GetAssetFromBucketProps {
  filePath: string;
  fileName: string;
}

export async function getAssetFromBucket({
  filePath,
  fileName,
}: GetAssetFromBucketProps): Promise<string | null> {
  try {
    const { s3Client, bucketName } = await getAwsConfiguration({
      accessKeyId: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_SECRET || "",
    });

    const presignedUrl = await getAwsFileUrl({
      s3Client,
      bucketName,
      fileName,
      filePath,
    });

    return presignedUrl || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

interface DeleteAssetFromBucketProps {
  imageUrl?: string;
  bucketDir?: string;
  isPresignedUrl?: boolean;
  action?: "delete-asset" | "discharge-directory";
}

export async function deleteAssetFromBucket({
  imageUrl,
  isPresignedUrl = false,
  action = "delete-asset",
  bucketDir,
}: DeleteAssetFromBucketProps): Promise<boolean> {
  try {
    const { s3Client, bucketName } = await getAwsConfiguration({
      accessKeyId: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_SECRET || "",
    });

    if (action === "delete-asset" && imageUrl) {
      const key = (
        isPresignedUrl
          ? await getOriginalUrlFromPresignedUrl({ imageUrl })
          : imageUrl
      ).replace(`${AWS_BUCKET_URL}/`, "");

      const response = await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );

      return !!response;
    }
    if (action === "discharge-directory" && bucketDir) {
      const response = await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: bucketDir,
        })
      );

      return !!response;
    } else return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

interface DeleteMultipleAssetsFromBucketProps {
  imageUrls?: string[];
  isPresignedUrl?: boolean;
}

export async function deleteMultipleAssetsFromBucket({
  imageUrls,
  isPresignedUrl = false,
}: DeleteMultipleAssetsFromBucketProps): Promise<boolean> {
  try {
    const { s3Client, bucketName } = await getAwsConfiguration({
      accessKeyId: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_SECRET || "",
    });

    if (imageUrls && imageUrls?.length > 0) {
      const objects = await Promise.all(
        imageUrls.map(async (url) => {
          const key = (
            isPresignedUrl
              ? await getOriginalUrlFromPresignedUrl({ imageUrl: url })
              : url
          ).replace(`${AWS_BUCKET_URL}/`, "");
          return { Key: key };
        })
      );

      const response = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: objects,
            Quiet: false,
          },
        })
      );

      const deletedCount = response?.Deleted?.length || 0;
      return deletedCount === objects.length;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
