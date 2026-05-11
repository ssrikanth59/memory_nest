import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  vaultPin: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  language: {
    type: String,
    default: 'English (US)',
  },
  baby: {
    name: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    weight: { type: String, default: "" },
    height: { type: String, default: "" }
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
