import { verifyAuthToken } from "@/app/actions";
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

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<CustomResponse<boolean>>> {
  try {
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: null,
        },
        { headers: getCorsHeaders(origin), ...isAuthenticated, status: 200 }
      );
    }

    // remove the secret key in the user
    const response = await prisma.user.update({
      where: {
        email: isAuthenticated?.payload?.userData?.email,
      },
      data: {
        totpSecret: null,
      },
    });

    if (!response)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: false,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    return NextResponse.json(
      {
        status: 200,
        payload: true,
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
        payload: false,
      },
      { headers: getCorsHeaders(origin), status: 200 }
    );
  }
}
