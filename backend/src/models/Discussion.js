const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'doubt', 'resource', 'announcement', 'project'],
      default: 'general',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        isAnswer: Boolean,
        upvotes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replyCount: {
      type: Number,
      default: 0,
    },
    answerCount: {
      type: Number,
      default: 0,
    },
    lastReplyAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
discussionSchema.index({ courseId: 1, createdAt: -1 });
discussionSchema.index({ courseId: 1, isPinned: -1, createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ tags: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
