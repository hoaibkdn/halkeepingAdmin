import { ErrorConstant } from '../constants/error-constants';

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
    super(message || ErrorConstant.INVALID_REQUEST, 400);
  }
}

class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message || ErrorConstant.FORBIDDEN, 403);
  }
}

class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message || ErrorConstant.UNAUTHORIZED, 401);
  }
}

class UnknowException extends HttpException {
  constructor(message?: string) {
    super(message || ErrorConstant.UNKNOWN_ERROR, 501);
  }
}

export { HttpException, BadRequestException, ForbiddenException, UnauthorizedException, UnknowException };
