import { getDB } from '../db';
import { Collection } from '../utils/constants/collection';
import { IConfiguration } from '../models/configuration';
import { ToolJobRequest } from '../controllers/job.controllers';
import { METHOD } from '../models/payment';

const createNewJobDB = async (
  customerId: string,
  input: {
    workdate: string;
    numberOfClean: number;
    durationEachClean: number;
    method: METHOD;
    tools?: ToolJobRequest[];
  },
  config: IConfiguration,
) => {
  const duration = input.numberOfClean * input.durationEachClean;
  return await getDB()
    .collection(Collection.JOB)
    .insertOne({
      customerId,
      workDate: input.workdate,
      payment: (input.method = METHOD.CASH),
      isPay: false,
      pricePerHour: getPricePerHour(duration, config),
      duration: calDurationJob(input.numberOfClean, input.durationEachClean),
      total: calTotalJob(duration, config, input.tools),
    });
};

// duration is minute
const calDurationJob = (numberOfClean: number, durationEachClean: number): number => {
  return durationEachClean * numberOfClean;
};

const getPricePerHour = (duration: number, config: IConfiguration): number => {
  if (duration / 60 > 3) {
    return config.priceFromThreeHour;
  }

  return config.basicPriceHour;
};

const calTotalJob = (duration: number, config: IConfiguration, tools?: ToolJobRequest[]): number => {
  let value = 0;

  if (duration / 60 > 3) {
    value = (config.priceFromThreeHour / 60) * duration;
  } else {
    value = (config.basicPriceHour / 60) * duration;
  }

  (tools || []).forEach((i) => (value += i.realPrice));

  return value;
};

export { createNewJobDB };
