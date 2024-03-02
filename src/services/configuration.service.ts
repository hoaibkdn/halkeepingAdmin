import { getDB } from '../db';
import { Collection } from '../utils/constants/collection';

const getInfoConfiguration = async () => getDB().collection(Collection.CONFIGURATION).findOne({});

export { getInfoConfiguration };
