import mongoose, { Schema, Document } from 'mongoose';

export interface ICapsule extends Document {
  name?: string;
  content: string;
  unlockDate: Date;
  status: 'locked' | 'unlocked';
  pin?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CapsuleSchema = new Schema<ICapsule>(
  {
    name: { type: String },
    content: { type: String, required: true },
    unlockDate: { type: Date, required: true },
    status: { type: String, enum: ['locked', 'unlocked'], default: 'locked' },
    pin: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Capsule || mongoose.model<ICapsule>('Capsule', CapsuleSchema);
