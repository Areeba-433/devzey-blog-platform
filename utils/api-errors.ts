import { NextApiResponse } from 'next';
import { ValidationError } from './validation';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown, res: NextApiResponse): void {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      field: error.field,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}

export function sendSuccess(res: NextApiResponse, data: any, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendNotFound(res: NextApiResponse, message = 'Resource not found'): void {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message,
  });
}

export function sendBadRequest(res: NextApiResponse, message: string): void {
  res.status(400).json({
    success: false,
    error: 'Bad Request',
    message,
  });
}
