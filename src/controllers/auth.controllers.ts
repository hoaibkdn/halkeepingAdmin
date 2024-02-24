import { RequestHandler, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { logger } from "../logger";
import { requestHandler } from "../middleware/request.middleware";
import { UnauthorizedException } from "../utils/error-handler/platform-exceptions";
import { getDB } from "../db";

const loginWrapper: RequestHandler = async (req, res, next: NextFunction) => {
  logger.info("===== Request Param ===== ", req.body);

  const { email = undefined, password = undefined } = req.body;

  const user = await getDB().collection("users").findOne({ email });

  logger.info("========== User", user);

  if (!user || !bcrypt.compare(password, user.password)) {
    return next(new UnauthorizedException("Authentication failed. Invalid user or password."));
  }

  res.json({
    data: {
      token: jwt.sign(
        { email: user.email, fullName: user.fullName, _id: user._id },
        "RESTFULAPIs"
      ),
    },
  });
}

export const login = requestHandler(loginWrapper, { skipJwtAuth: true });
