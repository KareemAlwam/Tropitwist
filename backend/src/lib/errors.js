export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asyncRoute(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

export function errorHandler(error, _request, response, _next) {
  if (error?.name === 'ZodError') {
    return response.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid fields.',
        details: error.flatten().fieldErrors,
      },
    });
  }

  const status = error instanceof ApiError ? error.status : 500;
  const payload = {
    code: error instanceof ApiError ? error.code : 'INTERNAL_ERROR',
    message: error instanceof ApiError ? error.message : 'An unexpected error occurred.',
  };
  if (error instanceof ApiError && error.details) payload.details = error.details;
  if (!(error instanceof ApiError)) console.error(error);
  return response.status(status).json({ error: payload });
}
