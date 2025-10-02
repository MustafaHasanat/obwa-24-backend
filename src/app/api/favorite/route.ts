import { verifyAuthToken } from "@/app/actions";
import { prisma } from "@/configs";
import { getCorsHeaders } from "@/constants";
import { Messages } from "@/enums";
import { CreateFavorite, Favorite } from "@/models";
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
 * @param userId string
 * @param productId string
 * @param page number
 * @param pageSize number
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CustomPaginatedResponse<Favorite>>> {
  try {
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = await verifyAuthToken(authHeader);
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
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
        { headers: getCorsHeaders(origin), ...isAuthenticated, status: 200 }
      );
    }

    const totalFavorites = await prisma.favorites.count({});

    const favorites = await prisma.favorites.findMany({
      where: {
        ...(businessId ? { businessId } : {}),
        ...(userId ? { userId } : {}),
        ...(productId ? { productId } : {}),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const { nextPage, pagesCount, prevPage } = getPaginationDetails({
      page,
      pageSize,
      totalRecords: totalFavorites,
    });

    return NextResponse.json(
      {
        status: 200,
        payload: favorites as Favorite[],
        message: Messages.FAVORITES_FOUND,
        count: totalFavorites,
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
      { headers: getCorsHeaders(origin), status: 200 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CustomResponse<Favorite>>> {
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
        { headers: getCorsHeaders(origin), ...isAuthenticated, status: 200 }
      );
    }

    const favoriteData = await extractDataFromRequest<CreateFavorite>({
      jsonData,
      type: "json",
      fields: ["type", "businessId", "productId", "userId"],
    });

    const favorite = await prisma.favorites.create({
      data: {
        ...favoriteData,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        payload: favorite as Favorite,
        message: Messages.ADDED_TO_FAVORITE,
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
