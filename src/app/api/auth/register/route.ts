import { prisma } from "@/configs";
import { AccountType, Messages } from "@/enums";
import {
  Business,
  CreateBusiness,
  CreateUser,
  User,
  UserBusiness,
} from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createBusinessAction } from "@/app/actions/create-business-action";
import { getCorsHeaders } from "@/constants";
import jwt from "jsonwebtoken";

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

    const userData = await extractDataFromRequest<
      CreateUser & { businessId?: string }
    >({
      jsonData,
      type: "json",
      fields: [
        "firstName",
        "lastName",
        "email",
        "password",
        "confirmPassword",
        "accountType",
        "businessId",
      ],
    });

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData?.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 500,
          payload: null,
          message: Messages.USER_EXIST,
        },
        { headers: getCorsHeaders(origin), status: 200 }
      );
    }

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      confirmPassword,
      password,
      accountType,
      businessId,
      ...rest
    } = userData;

    // Hash the password using bcrypt (one-way function)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with the hashed password
    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        accountType,
      },
    });

    const userBusinesses: UserBusiness[] = [];
    let currentBusiness: Business | null = null;

    // if the account type was an owner, create a business for them
    if (accountType === AccountType.OWNER) {
      const businessData = await extractDataFromRequest<CreateBusiness>({
        jsonData,
        type: "json",
        fields: ["name", "mapsUrl"],
      });

      const business = await createBusinessAction({
        businessData: {
          ...businessData,
        },
      });

      currentBusiness = business?.payload;
    }

    if (accountType === AccountType.AGENT) {
      // find the business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      currentBusiness = business as Business;
    }

    if (currentBusiness) {
      // link the business with the user
      await prisma.userBusiness.create({
        data: {
          businessId: currentBusiness?.id || "",
          userId: user?.id || "",
        },
      });

      userBusinesses.push({
        userId: user?.id || "",
        businessId: currentBusiness?.id || "",
        business: currentBusiness as Business,
        user: user as User,
      } as UserBusiness);
    }

    // Generate a JWT access token for subsequent requests
    const accessToken = jwt.sign(
      { ...user },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        status: 200,
        payload: {
          ...({ ...user, userBusinesses } as User),
          accessToken,
        },
        message: Messages.USER_CREATED,
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
      { headers: getCorsHeaders(origin), status: 200 }
    );
  }
}
