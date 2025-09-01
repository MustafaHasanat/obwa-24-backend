import {
  deleteAssetFromBucket,
  uploadAssetToBucket,
  verifyAuthToken,
} from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { BucketFileType, BucketPath, Messages } from "@/enums";
import { UpdateUser, User } from "@/models";
import { CustomResponse, FileObject } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<CustomResponse<User>>> {
  try {
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);
    const jsonData = await request.json();

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: null,
        },
        { headers: getCorsHeaders(origin), ...isAuthenticated, status: 200 }
      );
    }

    const userData = await extractDataFromRequest<
      UpdateUser & {
        id?: string;
        oldAvatar?: string;
        avatar: FileObject;
      }
    >({
      jsonData,
      type: "json",
      fields: ["businessId"],
    });

    const { avatar, ...restObject } = userData;

    const finalObject = structuredClone(restObject) as UpdateUser & {
      avatar?: string;
    };

    // if the user uploaded a file:
    if (avatar?.file && typeof avatar?.file !== "string") {
      // upload the image on the bucket
      const avatarUrl = await uploadAssetToBucket({
        fileObject: avatar,
        identifier:
          userData?.id || isAuthenticated?.payload?.userData?.id || "",
        bucketPath: BucketPath.USERS,
        type: BucketFileType.USER_AVATAR,
      });

      // assign the new avatar to the final object
      if (avatarUrl && typeof avatarUrl === "string") {
        finalObject["avatar"] = avatarUrl;
      } else {
        return NextResponse.json(
          {
            status: 500,
            message: Messages.UPLOADING_FAILED,
            payload: null,
          },
          { headers: getCorsHeaders(origin), status: 200 }
        );
      }
    }

    // update the user data
    const response = await prisma.user.update({
      where: {
        email: isAuthenticated?.payload?.userData?.email,
      },
      data: finalObject,
    });

    if (!response)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: null,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    // if the was an old avatar uploaded and has been replaced with a new one, delete the old one from the bucket
    if (userData?.oldAvatar && finalObject?.avatar)
      await deleteAssetFromBucket({
        imageUrl: userData?.oldAvatar,
        isPresignedUrl: true,
      });

    return NextResponse.json(
      {
        status: 200,
        payload: response as User,
        message: Messages.IMAGE_DELETED,
      },
      { headers: getCorsHeaders(origin), status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        message: Messages.UNKNOWN_ERROR,
        payload: null,
      },
      { headers: getCorsHeaders(origin), status: 200 }
    );
  }
}
