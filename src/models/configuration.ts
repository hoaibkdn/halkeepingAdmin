import { Document, Model, Schema, model } from 'mongoose';

export interface IConfiguration extends Document {
  id: string;
  basicPriceHour: number;
  priceFromThreeHour: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IConfigurationModel extends Model<IConfiguration> {}

const schema = new Schema({
  id: { type: String, required: true },
  basicPriceHour: {
    type: Number,
    required: true,
  },
  priceFromThreeHour: {
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

export const Tool: IConfigurationModel = model<IConfiguration, IConfigurationModel>('Configuration', schema);
