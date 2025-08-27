import { Messages } from "@/enums";
import { CustomResponse } from "@/types";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
}

export async function verifyAuthToken(
  authHeader: string | null
): Promise<CustomResponse<boolean>> {
  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        message: Messages.UNAUTHORIZED,
        payload: null,
        status: 401,
      };
    }

    const token = authHeader.split(" ")[1];
    const decodedData = verifyAuthToken(token);

    if (!decodedData) {
      return {
        message: Messages.EXPIRED_TOKEN,
        payload: null,
        status: 401,
      };
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!!!payload?.id)
      return {
        message: Messages.INVALID_TOKEN,
        payload: null,
        status: 401,
      };

    return {
      message: Messages.AUTHORIZED,
      payload: true,
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return {
      message: Messages.UNKNOWN_ERROR,
      payload: null,
      status: 500,
    };
  }
}
