import { Messages, UserStatus } from "@/enums";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/configs";
import speakeasy from "speakeasy";
import { getCorsHeaders } from "@/constants";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

interface VerifyToken2FAProps {
  token: string;
  email: string;
  setupKey?: string;
  action: "setup" | "verify";
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<string>>> {
  try {
    const origin = request.headers.get("origin");
    const { action, email, token, setupKey } =
      (await request.json()) as VerifyToken2FAProps;

    // check if the user has a TOTP secret
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user?.id)
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.UNKNOWN_ERROR,
        },
        { headers: getCorsHeaders(origin), status: 500 }
      );

    // if the action is to setup, check the setupKey
    if (action === "setup" && !setupKey)
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.UNKNOWN_ERROR,
        },
        { headers: getCorsHeaders(origin), status: 500 }
      );

    // if the action is to verify, assure that the user hasn't exceeded their attempts limit
    if (
      action === "verify" &&
      (user?.failedVerifyAttempts >= 5 || user?.status === UserStatus.BLOCKED)
    )
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.ACCOUNT_BLOCKED,
        },
        { headers: getCorsHeaders(origin), status: 500 }
      );

    const isVerified = speakeasy.totp.verify({
      secret:
        (action === "setup" && setupKey ? setupKey : user?.totpSecret) || "",
      encoding: "base32",
      token,
      window: 1,
    });

    // if the user tried to verify and entered a wrong code, increment the failed verifying attempts
    if (!isVerified && action === "verify") {
      const updateFailureAttempts = await prisma.user.update({
        where: {
          email,
        },
        data: {
          failedVerifyAttempts: user?.failedVerifyAttempts + 1,
          ...(user?.failedVerifyAttempts + 1 >= 5 && { status: "blocked" }),
        },
      });

      if (!updateFailureAttempts)
        return NextResponse.json(
          {
            status: 500,
            payload: null,
            message: Messages.UNKNOWN_ERROR,
          },
          { headers: getCorsHeaders(origin), status: 500 }
        );

      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.LOW_LOGIN_ATTEMPTS.replace(
            "COUNT",
            (5 - (user?.failedVerifyAttempts + 1))?.toString()
          ),
        },
        { headers: getCorsHeaders(origin), status: 500 }
      );
    }

    if (isVerified) {
      // if the action is a setup action, store the temporary setupKey in the database as a permanent secret
      if (action === "setup" && setupKey) {
        const response = await prisma.user.update({
          where: {
            email,
          },
          data: {
            totpSecret: setupKey,
          },
        });

        if (!response)
          return NextResponse.json(
            {
              status: 500,
              payload: null,
              message: Messages.UNKNOWN_ERROR,
            },
            { headers: getCorsHeaders(origin), status: 500 }
          );
      }
      // if the action is a verify action, assure to reset the failure attempts
      if (action === "verify") {
        const response = await prisma.user.update({
          where: {
            email,
          },
          data: {
            failedVerifyAttempts: 0,
          },
        });

        if (!response)
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

    return NextResponse.json(
      {
        payload: action === "setup" ? token : user?.totpSecret,
        message: Messages.VERIFIED,
        status: 200,
      },
      { headers: getCorsHeaders(origin), status: 200 }
    );
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
