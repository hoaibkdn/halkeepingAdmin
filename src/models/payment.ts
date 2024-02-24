import { Document, Model, Schema, model } from 'mongoose';

export enum METHOD {
  CASH = 'cash',
  CREDIT = 'credit',
}

export interface IPayment extends Document {
  id: string;
  method: METHOD;
  /** createdAt */
  createdAt: Date;
  /** updatedAt */
  updatedAt: Date;
}

interface IPaymentModel extends Model<IPayment> {}

const schema = new Schema({
  id: { type: String, required: true },
  method: {
    type: String,
    required: true,
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

export const User: IPaymentModel = model<IPayment, IPaymentModel>('Payment', schema);
