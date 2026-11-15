import mongoose from 'mongoose';

const AppMetadataSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: true,
      default: 'Instant Percentage Calculator',
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    environment: {
      type: String,
      default: process.env.NODE_ENV || 'development',
    },
    lastStarted: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AppMetadata = mongoose.models.AppMetadata || mongoose.model('AppMetadata', AppMetadataSchema);

export default AppMetadata;
