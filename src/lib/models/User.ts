import { model, Schema, Model, Document } from 'mongoose';

const userSchema = new Schema({
  uid: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  enckey: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  data: {
    type: [Object]
  }
});

export interface UserDocument extends Document {
  uid: string;
  password: string;
  nickname: string;
  enckey: string;
  data: [Object];
  comparePassword(userPw: string): boolean;
}

const User: Model<UserDocument> = model('user', userSchema);

export default User;
