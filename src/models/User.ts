import { Document, Model, Schema, model } from 'mongoose';

export interface IUser extends Document {
  /** Email */
  email: string;
  /** Password */
  password: string;
  /** Password */
  username: string;
  /** Password */
  phone: string;
  birthday: Date;
  webId: String;
  fullName: String;
  role: String;
  /** createdAt */
  createdAt: Date;
  /** updatedAt */
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {}

const schema = new Schema({
  email: { type: String, required: true },
  username: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  phone: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  role: {
    type: Number,
    default: 2,
  },
  webId: {
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

export const User: IUserModel = model<IUser, IUserModel>('User', schema);
