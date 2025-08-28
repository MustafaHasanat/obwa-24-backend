import { prisma } from "@/configs";
import { corsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { User } from "@/models";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
): Promise<NextResponse<CustomResponse<User>>> {
  try {
    const { identifier } = await params;
    const searchParams = request.nextUrl.searchParams;
    const identifierType = searchParams.get("identifierType") as "id" | "email";
    const withBusinesses = searchParams.get("withBusinesses");

    if (!identifier)
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.UNKNOWN_ERROR,
        },
        { headers: corsHeaders, status: 500 }
      );

    const user = await prisma.user.findUnique({
      where: {
        ...(identifierType === "id" && identifier && { id: identifier }),
        ...(identifierType === "email" && identifier && { email: identifier }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        ...(withBusinesses && {
          userBusinesses: {
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                  mapsUrl: true,
                },
              },
            },
          },
        }),
      },
    });

    if (!user)
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.UNKNOWN_ERROR,
        },
        { headers: corsHeaders, status: 500 }
      );

    return NextResponse.json(
      {
        status: 200,
        payload: user as unknown as User,
        message: Messages.PRODUCT_CREATED,
      },
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        payload: null,
        message: Messages.UNKNOWN_ERROR,
      },
      { headers: corsHeaders, status: 500 }
    );
  }
}
