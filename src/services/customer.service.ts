import { getDB } from '../db';
import { Collection } from '../utils/constants/collection';

const addCustomerByPhone = async (customerInfo: { name: string; phone: string; address: string; email: string }) => {
  let customer = await getDB().collection(Collection.CUSTOMER).findOne({ phone: customerInfo.phone });

  if (!customer) {
    customer = await getDB().collection(Collection.CUSTOMER).insertOne(customerInfo);
  }

  return customer;
};

export { addCustomerByPhone as addCustomerPhoneNumber };
