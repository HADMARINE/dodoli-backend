import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  password: {
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

module.exports = userSchema;
