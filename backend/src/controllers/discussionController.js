const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const notificationController = require('./notificationController');

// Get course discussions
exports.getDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { category, limit = 20, page = 1, sortBy = 'createdAt' } = req.query;

    const filter = { courseId };
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const discussions = await Discussion.find(filter)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .sort({
        isPinned: -1,
        [sortBy]: -1,
      })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Discussion.countDocuments(filter);

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, category = 'general', tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const discussion = new Discussion({
      courseId,
      title,
      content,
      author: req.user.id,
      category,
      tags,
    });

    await discussion.save();
    await discussion.populate('author', 'name avatar');

    // Notify course instructor
    await notificationController.createNotification(course.instructor, {
      type: 'new_discussion',
      title: 'New Discussion',
      message: `New discussion in "${course.title}": ${title}`,
      data: {
        courseId,
        discussionId: discussion._id,
        actionUrl: `/courses/${courseId}/discussions/${discussion._id}`,
      },
    });

    res.status(201).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get discussion details
exports.getDiscussionDetails = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    })
      .populate('author', 'name avatar email')
      .populate('replies.author', 'name avatar');

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to discussion
exports.replyToDiscussion = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;
    const { content, isAnswer = false } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content required' });
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    if (discussion.isLocked) {
      return res.status(403).json({ success: false, message: 'Discussion is locked' });
    }

    const reply = {
      author: req.user.id,
      content,
      isAnswer,
      createdAt: new Date(),
    };

    discussion.replies.push(reply);
    discussion.replyCount += 1;
    if (isAnswer) discussion.answerCount += 1;
    discussion.lastReplyAt = new Date();

    await discussion.save();
    await discussion.populate('replies.author', 'name avatar');

    // Notify discussion author
    await notificationController.createNotification(discussion.author, {
      type: 'discussion_reply',
      title: 'New Reply to Your Discussion',
      message: `Someone replied to your discussion: "${discussion.title}"`,
      data: {
        discussionId,
        courseId,
        actionUrl: `/courses/${courseId}/discussions/${discussionId}`,
      },
    });

    res.status(201).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upvote discussion
exports.upvoteDiscussion = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const alreadyUpvoted = discussion.upvotedBy.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      discussion.upvotedBy = discussion.upvotedBy.filter((id) => id.toString() !== userId);
      discussion.upvotes -= 1;
    } else {
      // Add upvote
      discussion.upvotedBy.push(userId);
      discussion.upvotes += 1;
    }

    await discussion.save();

    res.json({
      success: true,
      data: discussion,
      upvoted: !alreadyUpvoted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pin/Unpin discussion (instructor/admin only)
exports.togglePin = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
      pinned: discussion.isPinned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lock/Unlock discussion (instructor/admin only)
exports.toggleLock = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    discussion.isLocked = !discussion.isLocked;
    await discussion.save();

    res.json({
      success: true,
      data: discussion,
      locked: discussion.isLocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete discussion (author/instructor/admin only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;

    const discussion = await Discussion.findOne({
      _id: discussionId,
      courseId,
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    if (
      discussion.author.toString() !== req.user.id &&
      req.user.role !== 'instructor' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Discussion.findByIdAndDelete(discussionId);

    res.json({
      success: true,
      message: 'Discussion deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
