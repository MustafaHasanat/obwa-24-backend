import { verifyAuthToken } from "@/app/actions";
import { deleteAssetFromBucket } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<null>>> {
  try {
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "";
    const imageUrl = searchParams.get("imageUrl") || "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any = null;

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: null,
        },
        { headers: getCorsHeaders(origin), ...isAuthenticated }
      );
    }

    if (type === "avatar") {
      const res = await prisma.user.update({
        where: { id: isAuthenticated?.payload?.userData?.id },
        data: {
          avatar: null,
        },
      });

      response = res;
    }

    if (!response)
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.UNKNOWN_ERROR,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    await deleteAssetFromBucket({
      imageUrl: imageUrl,
      isPresignedUrl: true,
    });

    return NextResponse.json(
      {
        status: 200,
        payload: null,
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
      { headers: getCorsHeaders(origin), status: 500 }
    );
  }
}
