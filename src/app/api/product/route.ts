import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { corsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CreateProduct, Product } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const authHeader = request.headers.get("authorization");
    const isVerified = await verifyAuthToken(authHeader);

    if (isVerified?.status !== 200) {
      return NextResponse.json(
        {
          ...isVerified,
          payload: null,
        },
        { headers: corsHeaders, ...isVerified }
      );
    }

    const productData = await extractDataFromRequest<CreateProduct>({
      request,
      type: "json",
      fields: [
        "title",
        "description",
        "price",
        "image",
        "refillPrice",
        "count",
        "volume",
        "deliveryFee",
      ],
    });

    const product = await prisma.product.create({
      data: {
        ...productData,
        reviews: {},
        orderItems: {},
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: product as Product,
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
