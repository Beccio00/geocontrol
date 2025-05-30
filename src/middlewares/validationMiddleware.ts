import { CONFIG } from "@config";
import * as OpenApiValidator from "express-openapi-validator";

export const ApiValidationMiddleware = OpenApiValidator.middleware({
    apiSpec: CONFIG.SWAGGER_V1_FILE_PATH,
    validateRequests: true,
    validateResponses: true
});
