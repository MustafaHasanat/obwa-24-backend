import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { Favorite } from "@/models";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CustomResponse<Favorite>>> {
  try {
    const { id: favoriteId } = await params;
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

    const favorite = await prisma.favorites.delete({
      where: {
        id: favoriteId,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: favorite as Favorite,
        message: Messages.REMOVED_FROM_FAVORITE,
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
