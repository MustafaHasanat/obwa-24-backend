import { AWS_BUCKET_URL } from "@/constants";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { customJoin, getByPath, setByPath } from "./strings";

export const getAwsConfiguration = async ({
  accessKeyId,
  accessKeySecret,
}: {
  accessKeyId: string;
  accessKeySecret: string;
}) => {
  const bucketName = process.env.DIGITAL_OCEAN_SPACE_NAME || "";

  const s3Client = new S3Client({
    region: process.env.DIGITAL_OCEAN_SPACE_REGION || "",
    endpoint: process.env.DIGITAL_OCEAN_SPACE_ENDPOINT || "",
    credentials: {
      accessKeyId,
      secretAccessKey: accessKeySecret,
    },
  });

  return { bucketName, s3Client };
};

export const getAwsFileUrl = async ({
  bucketName,
  filePath,
  s3Client,
  fileName,
}: {
  bucketName: string;
  filePath: string;
  s3Client: S3Client;
  fileName: string;
}): Promise<string | null> => {
  try {
    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: customJoin(filePath, fileName).replace(/\/{2,}/g, "/"),
        // ResponseContentType: "image/png",
      }),
      {
        expiresIn: 3600, // 3600 seconds = 1 hour
      },
    );

    return presignedUrl || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function getObjectsWithPresignedImagesUrls<T>({
  objects,
  imagesKeys,
}: {
  imagesKeys: string[];
  objects: T[];
}): Promise<T[]> {
  try {
    const { s3Client, bucketName } = await getAwsConfiguration({
      accessKeyId: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_ID || "",
      accessKeySecret: process.env.DIGITAL_OCEAN_SPACE_ACCESS_KEY_SECRET || "",
    });

    const objectsWithPresignedImages = await Promise.all(
      objects?.map(async (object) => {
        const refinedImages: Record<string, string> = {};

        if (imagesKeys?.length === 0) return object;

        await Promise.all(
          imagesKeys.map(async (imageKey) => {
            const image = getByPath(object as Record<string, string>, imageKey);

            if (!image) return;

            const parts = image.replace(`${AWS_BUCKET_URL}/`, "").split("/");
            const lastIndex = parts?.length - 1;
            const lastSegment = parts[lastIndex];

            const presigned = await getAwsFileUrl({
              s3Client,
              bucketName,
              fileName: lastSegment,
              filePath: parts
                .slice(0, lastIndex)
                .join("/")
                .replace(/\/{2,}/g, "/"),
            });

            if (presigned) setByPath(refinedImages, imageKey, presigned);
          }),
        );

        return { ...object, ...refinedImages };
      }),
    );

    return objectsWithPresignedImages;
  } catch (error) {
    console.error(error);
    return [] as T[];
  }
}

export const getOriginalUrlFromPresignedUrl = async ({
  imageUrl,
}: {
  imageUrl: string;
}): Promise<string> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [originalUrl, query] = imageUrl?.split("?");

    return originalUrl;
  } catch (error) {
    console.error(error);
    return imageUrl;
  }
};
