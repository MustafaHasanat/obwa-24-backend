import { NextRequest } from "next/server";

export async function extractDataFromRequest<ReturnedType>({
  request,
  fields,
  type,
}: {
  request: NextRequest;
  fields: string[];
  type: "formData" | "json";
}): Promise<ReturnedType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: { [key: string]: any } = {};

  if (type === "formData") {
    const formData = await request.formData();
    fields.forEach((field) => {
      const value = formData.get(field);
      if (value) result[field] = value;
    });
  } else if (type === "json") {
    const data = await request.json();
    result = data;
  }

  return result as ReturnedType;
}
