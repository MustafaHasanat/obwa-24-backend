import { prisma } from "@/configs";
import { Messages } from "@/enums";
import { Business, CreateBusiness } from "@/models";
import { CustomResponse } from "@/types";

interface CreateBusinessActionProps {
  businessData: CreateBusiness;
}

export async function createBusinessAction({
  businessData,
}: CreateBusinessActionProps): Promise<CustomResponse<Business>> {
  try {
    const business = await prisma.business.create({
      data: {
        ...businessData,
        reviews: {},
        orders: {},
        orderItems: {},
        booklets: {},
        userBusinesses: {},
        products: {},
      },
    });

    if (!business) {
      console.error(business);
      return {
        message: Messages.UNKNOWN_ERROR,
        payload: null,
        status: 500,
      };
    }

    return {
      message: Messages.BUSINESS_CREATED,
      payload: business as Business,
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
