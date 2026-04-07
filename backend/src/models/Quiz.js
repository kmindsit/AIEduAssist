const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['multiple-choice', 'true-false'],
          required: true
        },
        options: [String],
        correctAnswer: {
          type: String,
          required: true
        },
        explanation: {
          type: String,
          default: ''
        }
      }
    ],
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    isAssignment: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for common queries
quizSchema.index({ courseId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
