import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import ErrorCodes from "../const/ErrorCodes";
import ErrorBase from "../errors/ErrorBase";
import { ErrorRequestHandler } from "express";
import { BaseError, AggregateError, ValidationError } from "sequelize";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handling of body-parser content malformed error
  if (err.type === "entity.parse.failed") {
    return res.status(BAD_REQUEST).send({
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
      message: "Malformed json",
    });
  }

  if (err instanceof ErrorBase) {
    const error = err;

    return res.status(error.getHttpStatusCode()).send({
      errorCode: error.getErrorCode(),
      message: error.getMessage(),
    });
  } else if (err instanceof BaseError) {
    let errorMessage: string[];

    if (err instanceof ValidationError) {
      errorMessage = err.errors.map((e) => e.message);
    } else if (err instanceof AggregateError) {
      errorMessage = err.errors.map((e) => e.message);
    }

    return res.status(BAD_REQUEST).send({
      errorCode: BAD_REQUEST,
      message: errorMessage,
    });
  } else {
    return res.status(INTERNAL_SERVER_ERROR).send({
      errorCode: ErrorCodes.RUNTIME_ERROR_CODE,
      message: "Internal Server Error",
    });
  }
};

export default globalErrorHandler;
