import { getDB } from '../db';
import { Collection } from '../utils/constants/collection';

const addJobTool = (input: { jobId: string; realPrice: number; toolId: string; note?: string }) => {
  getDB()
    .collection(Collection.JOB_TOOL)
    .insertOne({ ...input });
};

export { addJobTool };
