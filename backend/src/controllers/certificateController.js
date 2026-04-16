const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Course = require('../models/Course');
const User = require('../models/User');
const notificationController = require('./notificationController');
const crypto = require('crypto');

// Generate unique certificate number
const generateCertificateNumber = () => {
  return `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Get user certificates
exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, limit = 10, page = 1 } = req.query;

    const filter = { userId };
    if (courseId) filter.courseId = courseId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Certificate.countDocuments(filter);

    res.json({
      success: true,
      data: certificates,
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

// Get certificate details
exports.getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findById(certificateId)
      .populate('userId', 'name email')
      .populate('courseId', 'title description')
      .populate('instructor', 'name');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Allow access if user is certificate owner or admin
    if (
      certificate.userId.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Award certificate to user (called after course completion)
exports.awardCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Verify instructor/admin
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: 'User or course not found' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ userId, courseId });
    if (existingCert) {
      return res.status(400).json({ success: false, message: 'Certificate already exists' });
    }

    const certificateNumber = generateCertificateNumber();
    const certificate = new Certificate({
      userId,
      courseId,
      certificateNumber,
      title: `Certificate of Completion`,
      instructor: req.user.id,
      courseTitle: course.title,
      score: req.body.score || 100,
      status: 'issued',
      metadata: req.body.metadata || {},
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateNumber}`,
    });

    await certificate.save();

    // Create notification
    await notificationController.createNotification(userId, {
      type: 'certificate_awarded',
      title: 'Certificate Awarded',
      message: `Congratulations! You've earned a certificate for completing "${course.title}"`,
      data: {
        courseId,
        certificateId: certificate._id,
        actionUrl: `/certificates/${certificate._id}`,
      },
      priority: 'high',
      sendEmail: true,
    });

    res.status(201).json({
      success: true,
      data: certificate,
      message: 'Certificate awarded successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('userId', 'name')
      .populate('courseId', 'title');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (certificate.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is no longer valid',
        status: certificate.status,
      });
    }

    res.json({
      success: true,
      data: {
        certificateNumber: certificate.certificateNumber,
        userName: certificate.userId.name,
        courseName: certificate.courseId.title,
        issueDate: certificate.issueDate,
        verificationDate: new Date(),
        isValid: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Revoke certificate (admin only)
exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      { status: 'revoked' },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({
      success: true,
      data: certificate,
      message: 'Certificate revoked',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get certificates by instructor (instructor/admin only)
exports.getInstructorCertificates = async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filter = {};
    if (req.user.role === 'instructor') {
      filter.instructor = req.user.id;
    }

    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ issueDate: -1 })
      .limit(50);

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate sample certificate PDF URL
exports.generateCertificatePDF = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (certificate.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // In production, use a PDF generation library like pdfkit or puppeteer
    const pdfUrl = `/api/certificates/${certificateId}/download`;

    certificate.pdfUrl = pdfUrl;
    await certificate.save();

    res.json({
      success: true,
      pdfUrl,
      message: 'Certificate PDF generation queued',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
