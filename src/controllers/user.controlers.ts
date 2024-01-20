import { RequestHandler, NextFunction } from "express";
import { logger } from "../logger";
import { requestHandler } from "../middleware/request.middleware";
import { getDB } from "../db";

const getListUserWrapper: RequestHandler = async (req, res, next: NextFunction) => {
  logger.info("===== Request Param ===== ", req.body);

  const users = await getDB().collection("users").find({}).toArray();

  logger.info("========== User", users);

  res.json({
    data: {
      users: users || []
    },
  });
}

export const getListUser = requestHandler(getListUserWrapper, { skipJwtAuth: false });
