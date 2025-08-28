import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CreateProduct, Product } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const origin = request.headers.get("origin");
    const jsonData = await request.json();
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: null,
        },
        { headers: getCorsHeaders(origin), ...isAuthenticated }
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
