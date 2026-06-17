const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const certificateController = require('../controllers/certificateControllerSQLite');

/**
 * GET /api/certificates
 * Get all certificates (Admin only)
 */
router.get('/', authMiddleware, certificateController.getAllCertificates);

/**
 * GET /api/certificates/user/:user_id
 * Get all certificates for a user
 */
router.get('/user/:user_id', authMiddleware, certificateController.getUserCertificates);

/**
 * GET /api/certificates/course/:course_id
 * Get all certificates for a course
 */
router.get('/course/:course_id', certificateController.getCourseCertificates);

/**
 * GET /api/certificates/:id
 * Get certificate details
 */
router.get('/:id', certificateController.getCertificateById);

/**
 * POST /api/certificates/:id/verify
 * Verify a certificate
 */
router.post('/:id/verify', certificateController.verifyCertificate);

/**
 * GET /api/certificates/:id/download
 * Download certificate as PDF
 */
router.get('/:id/download', certificateController.downloadCertificate);

/**
 * POST /api/certificates/:id/share
 * Share certificate
 */
router.post('/:id/share', authMiddleware, certificateController.shareCertificate);

/**
 * GET /api/certificates/:id/stats
 * Get certificate statistics
 */
router.get('/:id/stats', certificateController.getCertificateStats);

module.exports = router;
