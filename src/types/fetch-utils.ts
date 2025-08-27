export type ObjectType = { [key: string]: string };

export type RequestProps = {
  endpoint?: string;
  endpointReplacements?: { [key: string]: string | number };
  baseUrl?: string;
  headers?: ObjectType;
  params?: ObjectType;
};

export type GetRequestProps = RequestProps & {};

export type GqlRequestProps = RequestProps & {
  query: string;
  variables?: ObjectType;
  operationName?: string;
};

export type PostRequestProps = RequestProps & {
  body?: ObjectType | FormData | string | File;
};

export type PutRequestProps = RequestProps & {
  body?: ObjectType;
};

export type DeleteRequestProps = RequestProps & {};
