import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { Product, UpdateProduct } from "@/models";
import { CustomResponse } from "@/types";
import { extractDataFromRequest } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const { id: productId } = await params;
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

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: product as Product,
        message: Messages.PRODUCT_FOUND,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const { id: productId } = await params;
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
        { headers: getCorsHeaders(origin), ...isAuthenticated, status: 200 }
      );
    }

    const productData = await extractDataFromRequest<UpdateProduct>({
      jsonData,
      type: "json",
      fields: [
        "title",
        "description",
        "price",
        "deliveryFee",
        "type",
        "refillPrice",
        "count",
        "vouchers",
        "volume",
        "image",
      ],
    });

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
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
        message: Messages.PRODUCT_UPDATED,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CustomResponse<Product>>> {
  try {
    const { id: productId } = await params;
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

    const product = await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: product as Product,
        message: Messages.PRODUCT_DELETED,
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
