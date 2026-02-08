export type ApiResponse<T> = {
  readonly data: T;
  readonly status?: number;
};

export type ApiErrorResponse = {
  readonly response?: {
    readonly data?: {
      readonly message?: string;
      readonly errors?: Record<string, readonly string[]>;
    };
    readonly status?: number;
  };
  readonly message?: string;
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const apiError = error as ApiErrorResponse | undefined;
  if (apiError?.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return 'An error occurred';
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && 'response' in error;
}
