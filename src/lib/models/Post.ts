import { model, Schema, Model, Document } from 'mongoose';

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  }
});

export interface PostDocument extends Document {
  title: string;
  data: string;
  user: string;
}

const Post: Model<PostDocument> = model('post', postSchema);

export default Post;