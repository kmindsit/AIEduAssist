const mongoose = require('mongoose');

const contentModuleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['video', 'document', 'article', 'interactive', 'assignment', 'quiz'],
      required: true,
    },
    orderIndex: {
      type: Number,
      required: true,
    },
    content: {
      videoUrl: String,
      documentUrl: String,
      documentType: String, // pdf, doc, etc
      htmlContent: String,
      interactive: {
        type: String,
        description: 'JSON stringified interactive content',
      },
      assignment: {
        description: String,
        dueDate: Date,
        maxScore: Number,
      },
    },
    duration: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentModule',
      },
    ],
    resources: [
      {
        title: String,
        url: String,
        type: String, // link, file, etc
      },
    ],
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    feedbacks: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for efficient queries
contentModuleSchema.index({ courseId: 1, orderIndex: 1 });
contentModuleSchema.index({ courseId: 1, isPublished: 1 });

module.exports = mongoose.model('ContentModule', contentModuleSchema);
