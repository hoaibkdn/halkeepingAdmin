import { NextFunction, RequestHandler } from 'express';
import { requestHandler } from '../middleware/request.middleware';
import { getListsToolService as getListToolsService } from '../services/tool.service';

const getListToolsWrapper: RequestHandler = async (req, res, next: NextFunction) => {
  const tools = await getListToolsService();

  res.json({
    data: {
      tools,
    },
  });
};

export const getListTools = requestHandler(getListToolsWrapper, { skipJwtAuth: false });
