const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: String,
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    skills: [String], // Skills acquired
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    courseTitle: String,
    courseDuration: Number, // in hours
    status: {
      type: String,
      enum: ['pending', 'issued', 'revoked'],
      default: 'issued',
    },
    verificationUrl: String,
    pdfUrl: String,
    metadata: {
      completionPercentage: Number,
      quizzesCompleted: Number,
      assignmentsCompleted: Number,
      discussionsParticipated: Number,
    },
  },
  { timestamps: true }
);

// Unique constraint on user-course combination
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
