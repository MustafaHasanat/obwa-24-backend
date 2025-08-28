import { prisma } from "@/configs";
import { AccountType, Messages } from "@/enums";
import { CreateBusiness, CreateUser, User } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createBusinessAction } from "@/app/actions/create-business-action";
import { corsHeaders } from "@/constants";
import jwt from "jsonwebtoken";

//! Add this in every route file
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<User>>> {
  try {
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
        { headers: corsHeaders, status: 500 }
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

      // link the business with the user
      await prisma.userBusiness.create({
        data: {
          businessId: business?.payload?.id || "",
          userId: user?.id || "",
        },
      });
    }

    if (accountType === AccountType.AGENT) {
      // find the business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (business) {
        // link the business with the user
        await prisma.userBusiness.create({
          data: {
            businessId: businessId || "",
            userId: user?.id || "",
          },
        });
      }
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
          ...(user as unknown as User),
          accessToken,
        },
        message: Messages.USER_CREATED,
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
