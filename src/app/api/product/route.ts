import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { corsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CreateProduct, Product } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const jsonData = await request.json();
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: null,
        },
        { headers: corsHeaders, ...isAuthenticated }
      );
    }

    const productData = await extractDataFromRequest<CreateProduct>({
      jsonData,
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
