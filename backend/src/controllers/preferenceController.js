const NotificationPreference = require('../models/NotificationPreference');

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await NotificationPreference.findOne({ userId });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = new NotificationPreference({ userId });
      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailNotifications, pushNotifications, inAppNotifications, quietHours, frequency } =
      req.body;

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    if (emailNotifications) {
      preferences.emailNotifications = { ...preferences.emailNotifications, ...emailNotifications };
    }

    if (pushNotifications) {
      preferences.pushNotifications = { ...preferences.pushNotifications, ...pushNotifications };
    }

    if (inAppNotifications) {
      preferences.inAppNotifications = {
        ...preferences.inAppNotifications,
        ...inAppNotifications,
      };
    }

    if (quietHours) {
      preferences.quietHours = { ...preferences.quietHours, ...quietHours };
    }

    if (frequency) {
      preferences.frequency = frequency;
    }

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enable/disable email notifications
exports.toggleEmailNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, enabled } = req.body;

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    if (type === 'all') {
      preferences.emailNotifications = {
        type: enabled,
        courseUpdates: enabled,
        quizReminders: enabled,
        discussionReplies: enabled,
        enrollmentUpdates: enabled,
        certificateAwarded: enabled,
        instructorMessages: enabled,
        promotions: enabled,
      };
    } else {
      preferences.emailNotifications[type] = enabled;
    }

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: `Email notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set quiet hours
exports.setQuietHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled, startTime, endTime, timezone } = req.body;

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Invalid time format (HH:MM)' });
    }

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    preferences.quietHours = {
      enabled,
      startTime,
      endTime,
      timezone: timezone || 'UTC',
    };

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: 'Quiet hours updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enable notification summary
exports.enableNotificationSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { frequency = 'weekly' } = req.body;

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    preferences.notificationSummary = {
      enabled: true,
      frequency,
    };

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: `Notification summary enabled (${frequency})`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disable notification summary
exports.disableNotificationSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    preferences.notificationSummary.enabled = false;

    await preferences.save();

    res.json({
      success: true,
      data: preferences,
      message: 'Notification summary disabled',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset preferences to default
exports.resetPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultPreferences = new NotificationPreference({ userId });
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      defaultPreferences.toObject(),
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences reset to default',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
