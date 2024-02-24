import { Document, Model, Schema, model } from 'mongoose';
import { Collection } from '../utils/constants/collection';

export interface ICustomer extends Document {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  numberOfBooking: number;
  /** createdAt */
  createdAt: Date;
  /** updatedAt */
  updatedAt: Date;
}

interface ICustomerModel extends Model<ICustomer> {}

const schema = new Schema({
  id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  numberOfBooking: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

schema.set('timestamps', true);

export const Customer: ICustomerModel = model<ICustomer, ICustomerModel>(Collection.CUSTOMER, schema);
