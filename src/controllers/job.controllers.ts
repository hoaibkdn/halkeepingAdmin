import { NextFunction, RequestHandler } from 'express';
import { requestHandler } from '../middleware/request.middleware';
import { UnknowException } from '../utils/error-handler/platform-exceptions';
import { createNewJobDB } from '../services/job.service';
import { METHOD } from '../models/payment';
import { getInfoConfiguration } from '../services/configuration.service';
import { addCustomerPhoneNumber } from '../services/customer.service';
import { addJobTool } from '../services/jobTool.service';

export interface ToolJobRequest {
  toolId: string;
  realPrice: number;
  note?: string;
}
export interface NewJobRequest {
  name: string;
  phone: string;
  email: string;
  address: string;
  workdate: string;
  numberOfClean: number;
  durationEachClean: number;
  method: METHOD;
  tools?: ToolJobRequest[];
}

const createNewJobWrapper: RequestHandler = async (req, res, next: NextFunction) => {
  const input: NewJobRequest = req.body;
  const customer = await addCustomerPhoneNumber({
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
  });

  if (!customer) {
    return next(new UnknowException('Created customer from Job failed'));
  }

  // Get config from DB
  const configurations = await getInfoConfiguration();

  // create new job
  const job = await createNewJobDB(customer._id, { ...input }, configurations);

  // Create job tool
  (input.tools || []).forEach(async (i: ToolJobRequest) => {
    await addJobTool({
      jobId: job.insertedId,
      realPrice: i.realPrice,
      toolId: i.toolId,
      note: i.note,
    });
  });

  res.json({
    data: {
      job: job.ops,
    },
  });
};

export const createNewJob = requestHandler(createNewJobWrapper, { skipJwtAuth: false });
