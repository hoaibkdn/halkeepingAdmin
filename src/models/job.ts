/** @format */

import { Model, model } from 'mongoose';
import { METHOD } from './payment';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export interface IJob extends Document {
  id: string;
  customerId: string;
  workdate: Date;
  duration: number;
  pricePerHour: number;
  payment: METHOD;
  total: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema({
  customerId: {
    type: String,
    required: true,
  },
  workdate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  payment: {
    type: String,
    default: METHOD.CASH,
  },
  total: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

interface IJobModel extends Model<IJob> {}

schema.set('timestamps', true);

export const Job: IJobModel = model<IJob, IJobModel>('job_v2', schema);
