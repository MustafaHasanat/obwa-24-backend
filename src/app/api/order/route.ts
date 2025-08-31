import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CreateOrder, Order } from "@/models";
import { CustomPaginatedResponse, CustomResponse } from "@/types";
import { extractDataFromRequest, getPaginationDetails } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

//! Add this in every route file
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

/**
 * Query params:
 *
 * @param businessId string
 * @param page number
 * @param pageSize number
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CustomPaginatedResponse<Order>>> {
  try {
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId") || "";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");

    if (isAuthenticated?.status !== 200) {
      return NextResponse.json(
        {
          ...isAuthenticated,
          payload: [],
          count: 0,
          pagesCount: 0,
          next: null,
          previous: null,
        },
        { headers: getCorsHeaders(origin), ...isAuthenticated }
      );
    }

    const totalOrders = await prisma.order.count({});

    const orders = await prisma.order.findMany({
      where: {
        businessId,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const { nextPage, pagesCount, prevPage } = getPaginationDetails({
      page,
      pageSize,
      totalRecords: totalOrders,
    });

    return NextResponse.json(
      {
        status: 200,
        payload: orders as Order[],
        message: Messages.PRODUCTS_FOUND,
        count: totalOrders,
        next: nextPage,
        previous: prevPage,
        pagesCount,
      },
      { headers: getCorsHeaders(origin), status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        message: Messages.UNKNOWN_ERROR,
        payload: [],
        count: 0,
        pagesCount: 0,
        next: null,
        previous: null,
      },
      { headers: getCorsHeaders(origin), status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<Order>>> {
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

    const orderData = await extractDataFromRequest<CreateOrder>({
      jsonData,
      type: "json",
      fields: ["status", "userId", "businessId"],
    });

    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderItems: {},
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: order as Order,
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
