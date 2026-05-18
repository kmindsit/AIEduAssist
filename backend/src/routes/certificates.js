const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authMiddleware, instructorMiddleware, adminMiddleware } = require('../middleware/auth');

// Get certificates (authenticated users)
router.get('/', authMiddleware, certificateController.getCertificates);

// Get certificate details
router.get('/:certificateId', authMiddleware, certificateController.getCertificateDetails);

// Verify certificate (public)
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

// Get instructor certificates
router.get('/instructor/list', instructorMiddleware, certificateController.getInstructorCertificates);

// Award certificate (instructor/admin)
router.post('/', instructorMiddleware, certificateController.awardCertificate);

// Generate PDF (authenticated)
router.post('/:certificateId/pdf', authMiddleware, certificateController.generateCertificatePDF);

// Revoke certificate (admin)
router.delete('/:certificateId', adminMiddleware, certificateController.revokeCertificate);

module.exports = router;
