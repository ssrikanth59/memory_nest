import mongoose, { Schema, Document } from 'mongoose';

export interface IMemory extends Document {
  title: string;
  description?: string;
  date: Date;
  type: 'photo' | 'video' | 'audio' | 'note';
  mediaUrl?: string;
  isFavorite: boolean;
  pin?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ['photo', 'video', 'audio', 'note'], required: true },
    mediaUrl: { type: String },
    isFavorite: { type: Boolean, default: false },
    pin: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Memory || mongoose.model<IMemory>('Memory', MemorySchema);
