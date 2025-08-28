export async function extractDataFromRequest<ReturnedType>({
  fields,
  type,
  formData,
  jsonData,
}: {
  fields: string[];
  type: "formData" | "json";
  formData?: FormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonData?: any;
}): Promise<ReturnedType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {};

  if (type === "formData" && formData) {
    fields.forEach((field) => {
      const value = formData.get(field);
      if (value) result[field] = value;
    });
  } else if (type === "json" && jsonData) {
    fields.forEach((field) => {
      const value = jsonData[field];
      if (value) result[field] = value;
    });
  }

  return result as ReturnedType;
}
