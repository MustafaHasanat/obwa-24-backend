"use server";

import { prisma } from "@/configs";
import { Messages } from "@/enums";
import { User } from "@/models";
import { CustomResponse, LoginReturnProps } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface GetUserActionProps {
  userId?: string;
  email?: string;
  password: string;
}

export async function getUserByPasswordAction({
  email,
  userId,
  password,
}: GetUserActionProps): Promise<CustomResponse<User & LoginReturnProps>> {
  try {
    if (!userId && !email)
      return {
        message: Messages.UNKNOWN_USER,
        payload: null,
        status: 500,
      };

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        ...(userId && { id: userId }),
        ...(email && { email }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        userBusinesses: {
          select: {
            business: {
              select: {
                id: true,
                name: true,
                mapsUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user)
      return {
        message: Messages.EMAIL_NOT_EXIST,
        payload: null,
        status: 500,
      };

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        message: Messages.INVALID_PASSWORD,
        payload: null,
        status: 500,
      };
    }

    // Generate a JWT access token for subsequent requests
    const accessToken = jwt.sign(
      { ...user },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return {
      message: Messages.LOGIN_SUCCESSFULLY,
      payload: {
        ...(user as unknown as User),
        accessToken,
      },
      status: 200,
    };
  } catch (error) {
    console.error("getUserAction error:", error);
    return {
      message: Messages.LOGIN_FAILED,
      payload: null,
      status: 500,
    };
  }
}

interface GetUserByEmailActionProps {
  email: string;
}

export async function getUserByEmailAction({
  email,
}: GetUserByEmailActionProps): Promise<
  CustomResponse<User & LoginReturnProps>
> {
  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        userBusinesses: {
          select: {
            business: {
              select: {
                id: true,
                name: true,
                mapsUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user)
      return {
        message: Messages.EMAIL_NOT_EXIST,
        payload: null,
        status: 500,
      };

    // Generate a JWT access token for subsequent requests
    const accessToken = jwt.sign(
      { ...user },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return {
      message: Messages.LOGIN_SUCCESSFULLY,
      payload: {
        ...(user as unknown as User),
        accessToken,
      },
      status: 200,
    };
  } catch (error) {
    console.error("getUserAction error:", error);
    return {
      message: Messages.LOGIN_FAILED,
      payload: null,
      status: 500,
    };
  }
}
