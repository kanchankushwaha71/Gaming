import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: any): NextResponse {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  // Handle Supabase errors
  if (error?.code) {
    const statusCode = getSupabaseErrorStatusCode(error.code);
    return NextResponse.json(
      {
        error: getSupabaseErrorMessage(error),
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }

  // Handle validation errors (Zod)
  if (error?.issues) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  );
}

function getSupabaseErrorStatusCode(code: string): number {
  const statusMap: Record<string, number> = {
    '23505': 409, // Unique constraint violation
    '23502': 400, // Not null violation
    '23503': 400, // Foreign key constraint violation
    '42P01': 500, // Table does not exist
    '22P02': 400, // Invalid UUID format
    '42710': 409, // Object already exists
  };
  
  return statusMap[code] || 500;
}

function getSupabaseErrorMessage(error: any): string {
  const messageMap: Record<string, string> = {
    '23505': 'A record with this information already exists',
    '23502': 'Missing required fields',
    '23503': 'Invalid reference to related data',
    '42P01': 'Database table not found',
    '22P02': 'Invalid data format',
    '42710': 'Resource already exists',
  };
  
  return messageMap[error.code] || error.message || 'Database error occurred';
}

export function createApiError(message: string, statusCode: number = 500, code?: string, details?: any): ApiError {
  return new ApiError(message, statusCode, code, details);
}

export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw createApiError(`Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
  }
}

export function validateAuth(session: any): void {
  if (!session?.user) {
    throw createApiError('Authentication required', 401, 'UNAUTHORIZED');
  }
}

export function validateAdmin(session: any): void {
  validateAuth(session);
  if (session.user.role !== 'admin') {
    throw createApiError('Admin access required', 403, 'FORBIDDEN');
  }
}
