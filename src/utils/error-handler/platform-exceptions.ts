import { ErrorCodeConstant } from "../constants/error-constants";

class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(message || ErrorCodeConstant.INVALID_REQUEST,
      403,
    );
  }
}

class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message || ErrorCodeConstant.FORBIDDEN,
      403,
    );
  }
}

class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(
      message || ErrorCodeConstant.USER_NOT_FOUND,
      404,
    );
  }
}

class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message || 'Unauthorized', 401);
  }
}

export {
  HttpException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
};
