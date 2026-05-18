import axiosInstance from '../utils/axios';

const certificateService = {
  // User Certificates
  getUserCertificates: (params = {}) =>
    axiosInstance.get('/certificates', { params }),

  getCertificateDetail: (certificateId) =>
    axiosInstance.get(`/certificates/${certificateId}`),

  verifyCertificate: (certificateNumber) =>
    axiosInstance.get(`/certificates/verify/${certificateNumber}`),

  downloadCertificatePDF: (certificateId) =>
    axiosInstance.get(`/certificates/${certificateId}/pdf`, {
      responseType: 'blob',
    }),

  // Instructor Certificates
  getIssuedCertificates: (params = {}) =>
    axiosInstance.get('/certificates/instructor/list', { params }),

  issueCertificate: (certificateData) =>
    axiosInstance.post('/certificates', certificateData),

  revokeCertificate: (certificateId) =>
    axiosInstance.delete(`/certificates/${certificateId}`),

  // Analytics
  getCertificateStats: () =>
    axiosInstance.get('/certificates/stats'),

  getCertificatesBySkill: (skill) =>
    axiosInstance.get('/certificates', { params: { skill } }),

  getCertificatesByStatus: (status) =>
    axiosInstance.get('/certificates', { params: { status } }),
};

export default certificateService;
