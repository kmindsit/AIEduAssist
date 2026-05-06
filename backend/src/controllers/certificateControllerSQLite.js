const CertificateSQLite = require('../models/CertificateSQLite');
const CourseSQLite = require('../models/CourseSQLite');

const certificateController = {
  // Get user certificates
  getUserCertificates: async (req, res) => {
    try {
      const user_id = req.params.user_id || req.user.id;

      const certificates = await CertificateSQLite.findByUser(user_id);

      // Enrich with course details
      const enriched = await Promise.all(
        certificates.map(async (cert) => {
          const course = await CourseSQLite.findById(cert.course_id);
          return { ...cert, course };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Certificates retrieved',
        data: enriched,
        count: enriched.length
      });
    } catch (err) {
      console.error('Error fetching certificates:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
  },

  // Get course certificates
  getCourseCertificates: async (req, res) => {
    try {
      const { course_id } = req.params;

      const certificates = await CertificateSQLite.findByCourse(course_id);

      res.status(200).json({
        success: true,
        message: 'Course certificates retrieved',
        data: certificates,
        count: certificates.length
      });
    } catch (err) {
      console.error('Error fetching certificates:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
  },

  // Get certificate details
  getCertificateById: async (req, res) => {
    try {
      const { id } = req.params;

      const certificate = await CertificateSQLite.findById(id);
      if (!certificate) {
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }

      // Check authorization
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const course = await CourseSQLite.findById(certificate.course_id);

      res.status(200).json({
        success: true,
        message: 'Certificate retrieved',
        data: {
          ...certificate,
          course
        }
      });
    } catch (err) {
      console.error('Error fetching certificate:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch certificate' });
    }
  },

  // Verify certificate
  verifyCertificate: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await CertificateSQLite.verify(id);

      res.status(result.valid ? 200 : 400).json({
        success: result.valid,
        message: result.message,
        data: result.certificate || null
      });
    } catch (err) {
      console.error('Error verifying certificate:', err);
      res.status(500).json({ success: false, message: 'Failed to verify certificate' });
    }
  },

  // Download certificate (Generate PDF in production)
  downloadCertificate: async (req, res) => {
    try {
      const { id } = req.params;

      const certificate = await CertificateSQLite.findById(id);
      if (!certificate) {
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }

      // Check authorization
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const course = await CourseSQLite.findById(certificate.course_id);

      // In production, generate PDF file here
      // For now, return certificate data
      res.status(200).json({
        success: true,
        message: 'Certificate data for download',
        data: {
          ...certificate,
          courseName: course.title,
          downloadUrl: `${process.env.BACKEND_URL}/api/certificates/${id}/download-pdf`
        }
      });
    } catch (err) {
      console.error('Error downloading certificate:', err);
      res.status(500).json({ success: false, message: 'Failed to download certificate' });
    }
  },

  // Share certificate
  shareCertificate: async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email required' });
      }

      const certificate = await CertificateSQLite.findById(id);
      if (!certificate) {
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }

      // Check authorization
      if (certificate.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // In production, send email with certificate link
      res.status(200).json({
        success: true,
        message: 'Certificate shared successfully',
        data: {
          certificateId: id,
          sharedWith: email,
          verificationUrl: certificate.verification_url
        }
      });
    } catch (err) {
      console.error('Error sharing certificate:', err);
      res.status(500).json({ success: false, message: 'Failed to share certificate' });
    }
  },

  // Get certificate statistics
  getCertificateStats: async (req, res) => {
    try {
      const user_id = req.user.id;

      const count = await CertificateSQLite.getUserCertificateCount(user_id);
      const recent = await CertificateSQLite.getUserCertificates(user_id);

      res.status(200).json({
        success: true,
        message: 'Statistics retrieved',
        data: {
          totalCertificates: count,
          recentCertificates: recent.slice(0, 5)
        }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
  },

  // Get all certificates (Admin only)
  getAllCertificates: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }

      const { limit = 10, offset = 0 } = req.query;

      const certificates = await CertificateSQLite.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        message: 'All certificates retrieved',
        data: certificates
      });
    } catch (err) {
      console.error('Error fetching certificates:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
    }
  }
};

module.exports = certificateController;
