import { NextResponse } from 'next/server';

type ResponseData = {
  [key: string]: any;
};

type ResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
};

export function apiResponse(
  data: ResponseData,
  options: ResponseOptions = {}
) {
  const { status = 200, headers = {} } = options;

  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

export function apiError(
  message: string,
  status: number = 400,
  details: any = null
) {
  return apiResponse(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}
