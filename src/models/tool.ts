import { Document, Model, Schema, model } from 'mongoose';

enum ToolType {
  BASIC = 'basic',
  VACUUM = 'vacuum',
}

export interface ITool extends Document {
  id: string;
  name: ToolType;
  defaultPrice: number;
  /** createdAt */
  createdAt: Date;
  /** updatedAt */
  updatedAt: Date;
}

interface IToolModel extends Model<ITool> {}

const schema = new Schema({
  id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  defaultPrice: {
    type: Number,
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

export const Tool: IToolModel = model<ITool, IToolModel>('Tool', schema);
