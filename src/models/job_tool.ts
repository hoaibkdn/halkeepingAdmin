import { Document, Model, Schema, model } from 'mongoose';

export interface IJobTool extends Document {
  id: string;
  jobId: string;
  toolId: string;
  realPrice: number;
  note: string;
  /** createdAt */
  createdAt: Date;
  /** updatedAt */
  updatedAt: Date;
}

interface IToolModel extends Model<IJobTool> {}

const schema = new Schema({
  id: { type: String, required: true },
  toolId: { type: String, require: true },
  jobId: { type: String, require: true },
  realPrice: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
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

export const Tool: IToolModel = model<IJobTool, IToolModel>('JobTool', schema);
