import { Messages } from "@/enums";
import { CreateUser, User } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { getUserByPasswordAction } from "@/app/actions";
import { getCorsHeaders } from "@/constants";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<User>>> {
  try {
    const origin = request.headers.get("origin");
    const jsonData = await request.json();

    const loginData = await extractDataFromRequest<CreateUser>({
      jsonData,
      type: "json",
      fields: ["email", "password"],
    });

    const user = await getUserByPasswordAction(loginData);

    if (user?.status !== 200 || !user?.payload)
      return NextResponse.json(user, {
        headers: getCorsHeaders(origin),
        ...user,
      });

    return NextResponse.json(user, {
      headers: getCorsHeaders(origin),
      ...user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        payload: null,
        message: Messages.UNKNOWN_ERROR,
      },
      { headers: getCorsHeaders(origin), status: 500 }
    );
  }
}
