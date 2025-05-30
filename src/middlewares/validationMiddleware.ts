import { CONFIG } from "@config";
import * as OpenApiValidator from "express-openapi-validator";
import { Request, Response, NextFunction } from "express";
import { createAppError } from "@services/errorService";

export const ApiValidationMiddleware = OpenApiValidator.middleware({
    apiSpec: CONFIG.SWAGGER_V1_FILE_PATH,
    validateRequests: true,
    validateResponses: true
});


export function validateDateRangeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (start > end) {
      const error = createAppError({
        code: 500
      });

      return next(error);
    }
  }

  next();
}