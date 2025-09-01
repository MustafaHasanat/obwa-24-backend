import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import speakeasy from "speakeasy";

/**
 * TOTP methodology:
 *
 * --- The setup workflow ---
 * 1: generate a temporary secret key (embedded in the QR code or the setup key)
 * 2: user scan the QR code or insert the setup key in the authenticator app
 * 3: user sends the TOTP-Token given by the authenticator app be verified
 * 4: upon verifying the token against the temporary secret, store that secret in the database
 *
 * --- The usage workflow ---
 * 1: user sends the TOTP-Token given by the authenticator app be verified
 * 2: that token is compared against the secret key stored in the database to give a boolean result
 *
 */

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

/**
 * Generate a new QR code string to be scanned, and a secret key for manual insertion.
 *
 * @returns QR code string and secret TOTP key
 */
export async function GET(request: NextRequest): Promise<
  NextResponse<
    CustomResponse<{
      qrCode: string;
      setupKey: string;
    }>
  >
> {
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

    if (!isAuthenticated?.payload?.userData?.id)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: null,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    const user = await prisma.user.findUnique({
      where: {
        id: isAuthenticated?.payload?.userData?.id,
      },
    });

    if (!user?.id)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: null,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    // generate a temporary TOTP setup key
    const setupKey = speakeasy.generateSecret({
      name: `MobiMenu: ${
        isAuthenticated?.payload?.userData?.email || "unknown"
      }`,
      length: 20,
    });

    if (!setupKey?.base32 || !setupKey?.otpauth_url)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: null,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    // generate a temporary TOTP QR code
    const qrCode = await QRCode.toDataURL(setupKey.otpauth_url || "");

    if (!qrCode)
      return NextResponse.json(
        {
          status: 500,
          message: Messages.UNKNOWN_ERROR,
          payload: null,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );

    return NextResponse.json(
      {
        status: 200,
        payload: {
          qrCode,
          setupKey: setupKey?.base32,
        },
        message: Messages.KEYS_GENERATED,
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
