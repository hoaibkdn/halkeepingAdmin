import { NextFunction, RequestHandler } from 'express';
import { requestHandler } from '../middleware/request.middleware';
import { BadRequestException, UnknowException } from '../utils/error-handler/platform-exceptions';
import { createNewJobDB } from '../services/job.service';
import { METHOD } from '../models/payment';
import { getInfoConfiguration } from '../services/configuration.service';
import { addCustomerPhoneNumber } from '../services/customer.service';
import { addJobTool } from '../services/jobTool.service';
import { isNumber, validateEmail, validatePhoneNumber } from '../utils/validate';
import { getListsToolService } from '../services/tool.service';

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

  if (
    !input.name ||
    !input.phone ||
    !input.email ||
    !input.address ||
    !input.workdate ||
    !input.numberOfClean ||
    !input.durationEachClean ||
    !input.method
  ) {
    return next(new BadRequestException('Missing required field'));
  }

  const tools = await getListsToolService();

  input.tools?.forEach((i) => {
    if (!i.toolId || !i.realPrice) {
      return next(new BadRequestException('Missing required field of tool request'));
    }

    if (!tools.find((k) => k._id == i.toolId)) {
      return next(new BadRequestException('toolId is wrong'));
    }
  });

  // Validate phone number
  if (!validatePhoneNumber(input.phone)) {
    return next(new BadRequestException('Invalid phone number format. Please provide a valid phone number.'));
  }

  // Validate email
  if (!validateEmail(input.email)) {
    return next(new BadRequestException('Invalid email format. Please provide a valid email.'));
  }

  // Validate method
  if (input.method !== METHOD.CASH && input.method !== METHOD.CREDIT) {
    return next(new BadRequestException('Invalid method format. Please provide a method'));
  }

  // Validate is number field
  if (!isNumber(input.durationEachClean) || !isNumber(input.numberOfClean)) {
    return next(new BadRequestException('Invalid durationEachClean or numberOfClean format'));
  }

  if (input.durationEachClean < 60) {
    return next(new BadRequestException('Duration of each clean should than or equal one hour'));
  }

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
