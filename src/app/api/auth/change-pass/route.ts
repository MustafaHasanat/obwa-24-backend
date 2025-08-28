import { Messages } from "@/enums";
import { User } from "@/models";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/constants";
import { prisma } from "@/configs";
import bcrypt from "bcryptjs";
import { getUserByPasswordAction } from "@/app/actions";

//! Add this in every route file
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

type UpdatePasswordProps = {
  data: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  skipCheck?: boolean;
  userId?: string;
  email?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<User>>> {
  try {
    const { data, email, skipCheck, userId } =
      (await request.json()) as UpdatePasswordProps;

    if (!userId && !email)
      return NextResponse.json(
        {
          message: Messages.BUSINESS_NOT_FOUND,
          payload: null,
          status: 404,
        },
        { headers: corsHeaders, status: 404 }
      );

    if (!skipCheck) {
      const user = await getUserByPasswordAction({
        ...(userId && { id: userId }),
        ...(email && { email }),
        password: data?.oldPassword as string,
      });

      if (user?.status !== 200 || !user?.payload)
        return NextResponse.json(user, { headers: corsHeaders, ...user });
    }

    const hashedPassword = await bcrypt.hash(data?.newPassword || "", 10);

    const user = await prisma.user.update({
      where: {
        ...(userId && { id: userId }),
        ...(email && { email }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      data: {
        password: hashedPassword,
      },
    });

    if (!user)
      return NextResponse.json(
        {
          message: Messages.UNKNOWN_ERROR,
          payload: null,
          status: 500,
        },
        { headers: corsHeaders, status: 500 }
      );

    return NextResponse.json(
      {
        message: Messages.PASS_CHANGED,
        payload: user as User,
        status: 200,
      },
      {
        headers: corsHeaders,
        status: 200,
      }
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
