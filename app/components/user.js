import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

import { LocationSchema } from './location';
import { ItemSchema } from './item';

const UserSchema = new Schema({
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  userLocation: {
    type: LocationSchema,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
    default: 'USER',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'NotSpecified', 'Other'],
    default: 'Male',
  },
  birthdate: {
    type: Date,
  },
  image: {
    type: String,
  },
  locations: [LocationSchema],
  wishList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Item',
  },
});
UserSchema.plugin(passportLocalMongoose);

const Users = mongoose.model('User', UserSchema);
export default Users;
