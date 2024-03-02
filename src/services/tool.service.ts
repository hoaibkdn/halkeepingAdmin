import { getDB } from '../db';
import { Collection } from '../utils/constants/collection';

const getListsToolService = async () => {
  let tools = await getDB().collection(Collection.TOOL).find({}).toArray();

  return tools;
};

export { getListsToolService };
