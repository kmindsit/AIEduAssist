const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment_confirmed',
        'course_started',
        'course_completed',
        'quiz_available',
        'quiz_reminder',
        'new_discussion',
        'discussion_reply',
        'certificate_awarded',
        'course_update',
        'instructor_message',
        'payment_confirmed',
        'system_alert',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      courseId: mongoose.Schema.Types.ObjectId,
      quizId: mongoose.Schema.Types.ObjectId,
      discussionId: mongoose.Schema.Types.ObjectId,
      certificateId: mongoose.Schema.Types.ObjectId,
      actionUrl: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    sendEmail: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
  },
  { timestamps: true }
);

// Index for efficient notification retrieval
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
