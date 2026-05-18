const ContentModule = require('../models/ContentModule');
const Course = require('../models/Course');

// Get course content modules
exports.getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await ContentModule.find({ courseId })
      .populate('quizId', 'title description')
      .sort({ orderIndex: 1 });

    if (!modules.length) {
      return res.json({
        success: true,
        data: [],
        message: 'No content modules found',
      });
    }

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get specific content module
exports.getContentModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const module = await ContentModule.findOne({
      _id: moduleId,
      courseId,
    }).populate('quizId', 'title description questions');

    if (!module) {
      return res.status(404).json({ success: false, message: 'Content module not found' });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create content module (instructor only)
exports.createContentModule = async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { courseId } = req.params;
    const {
      title,
      description,
      type,
      duration,
      difficulty = 'beginner',
      content,
      resources = [],
      quizId,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and type required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get next order index
    const lastModule = await ContentModule.findOne({ courseId }).sort({ orderIndex: -1 });
    const nextOrder = lastModule ? lastModule.orderIndex + 1 : 0;

    const module = new ContentModule({
      courseId,
      title,
      description,
      type,
      orderIndex: nextOrder,
      content,
      duration,
      difficulty,
      resources,
      quizId,
      isPublished: false,
    });

    await module.save();

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update content module (instructor only)
exports.updateContentModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const module = await ContentModule.findOneAndUpdate(
      { _id: moduleId, courseId },
      { $set: req.body },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Content module not found' });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publish content module (instructor only)
exports.publishContentModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const module = await ContentModule.findOneAndUpdate(
      { _id: moduleId, courseId },
      { isPublished: true },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ success: false, message: 'Content module not found' });
    }

    res.json({
      success: true,
      data: module,
      message: 'Content module published',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete content module (instructor only)
exports.deleteContentModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const module = await ContentModule.findOneAndDelete({
      _id: moduleId,
      courseId,
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Content module not found' });
    }

    res.json({
      success: true,
      message: 'Content module deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add feedback to module
exports.addModuleFeedback = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const module = await ContentModule.findOne({
      _id: moduleId,
      courseId,
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Content module not found' });
    }

    module.feedbacks.push({
      userId: req.user.id,
      rating,
      comment,
      createdAt: new Date(),
    });

    // Calculate average rating
    const totalRating = module.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    module.avgRating = (totalRating / module.feedbacks.length).toFixed(2);

    await module.save();

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder modules
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body;

    if (!req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    for (let i = 0; i < moduleIds.length; i++) {
      await ContentModule.findByIdAndUpdate(
        moduleIds[i],
        { orderIndex: i },
        { new: true }
      );
    }

    const updatedModules = await ContentModule.find({ courseId }).sort({ orderIndex: 1 });

    res.json({
      success: true,
      data: updatedModules,
      message: 'Modules reordered',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
