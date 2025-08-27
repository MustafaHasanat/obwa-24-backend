import { prisma } from "@/configs";
import { AccountType, Messages } from "@/enums";
import { CreateBusiness, CreateUser, User } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createBusinessAction } from "@/app/actions/create-business-action";
import { corsHeaders } from "@/constants";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<User>>> {
  try {
    const userData = await extractDataFromRequest<CreateUser>({
      request,
      type: "json",
      fields: [
        "firstName",
        "lastName",
        "avatar",
        "gender",
        "phoneNumber",
        "mapsUrl",
        "email",
        "password",
        "accountType",
        "token",
      ],
    });

    const businessData = await extractDataFromRequest<CreateBusiness>({
      request,
      type: "json",
      fields: ["name", "mapsUrl"],
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
      const business = await createBusinessAction({
        businessData: {
          ...businessData,
        },
      });

      if (!business)
        return NextResponse.json(
          {
            status: 500,
            payload: null,
            message: Messages.UNKNOWN_ERROR,
          },
          { headers: corsHeaders, status: 500 }
        );

      // link the business with the user
      const userBusiness = await prisma.userBusiness.create({
        data: {
          businessId: business?.payload?.id || "",
          userId: user?.id || "",
        },
      });

      if (!userBusiness)
        return NextResponse.json(
          {
            status: 500,
            payload: null,
            message: Messages.UNKNOWN_ERROR,
          },
          { headers: corsHeaders, status: 500 }
        );
    }

    return NextResponse.json(
      {
        status: 200,
        payload: user as User,
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
