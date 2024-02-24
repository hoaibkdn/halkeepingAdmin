import { RequestHandler, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../utils/error-handler/platform-exceptions';
import { logger } from '../logger';

interface HandlerOptions {
  skipJwtAuth?: boolean;
}

/**
 * This router wrapper catches any error from async await
 * and throws it to the default express error handler,
 * instead of crashing the app
 * @param handler Request handler to check for error
 */
export const requestHandler =
  (handler: RequestHandler, options?: HandlerOptions): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('==== Request Handler ===', req.body);
    if (!options?.skipJwtAuth) {
      const token = req.headers['authorization'];

      if (!token) {
        logger.info('Auth token is not supplied');
        return next(new UnauthorizedException('Auth token is not supplied'));
      }

      jwt.verify(token.split(' ')[1], 'RESTFULAPIs', function (err, decode) {
        if (err) {
          logger.info('Token Validation Failed');
          return next(new UnauthorizedException());
        }
        // req.user = decode;
        return handler(req, res, next);
      });
    } else {
      return handler(req, res, next);
    }
  };
