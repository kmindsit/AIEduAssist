const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    emailNotifications: {
      type: {
        type: Boolean,
        default: true,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
      quizReminders: {
        type: Boolean,
        default: true,
      },
      discussionReplies: {
        type: Boolean,
        default: true,
      },
      enrollmentUpdates: {
        type: Boolean,
        default: true,
      },
      certificateAwarded: {
        type: Boolean,
        default: true,
      },
      instructorMessages: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: false,
      },
    },
    pushNotifications: {
      type: {
        type: Boolean,
        default: true,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
      quizReminders: {
        type: Boolean,
        default: true,
      },
      discussionReplies: {
        type: Boolean,
        default: true,
      },
      enrollmentUpdates: {
        type: Boolean,
        default: true,
      },
      certificateAwarded: {
        type: Boolean,
        default: true,
      },
    },
    inAppNotifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      retentionDays: {
        type: Number,
        default: 30,
      },
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: String, // HH:MM format
      endTime: String,
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'immediate',
    },
    notificationSummary: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
