import React, { useState, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import certificateService from '../services/certificateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const CertificateManagementPage = () => {
  const { showNotification } = useNotification();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const statusColors = {
    issued: 'green',
    pending: 'yellow',
    revoked: 'red',
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
      };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const data = await certificateService.getUserCertificates(params);
      setCertificates(data);
    } catch (error) {
      showNotification('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      setDownloading(true);
      const blob = await certificateService.downloadCertificatePDF(certificateId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('Certificate downloaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to download certificate', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleVerifyCertificate = async (e) => {
    e.preventDefault();

    if (!verifyCode.trim()) {
      showNotification('Please enter a certificate number', 'warning');
      return;
    }

    try {
      const result = await certificateService.verifyCertificate(verifyCode);
      setVerificationResult(result);
      showNotification('Certificate verified!', 'success');
    } catch (error) {
      showNotification('Certificate not found or invalid', 'error');
      setVerificationResult(null);
    }
  };

  const handleShareCertificate = (certificateNumber) => {
    const verificationUrl = `${window.location.origin}/verify/${certificateNumber}`;
    navigator.clipboard.writeText(verificationUrl);
    showNotification('Verification link copied to clipboard!', 'success');
  };

  const filteredCertificates = certificates
    .filter((c) => filterStatus === 'all' || c.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.issueDate) - new Date(a.issueDate);
      }
      if (sortBy === 'course') {
        return a.courseTitle.localeCompare(b.courseTitle);
      }
      return b.score - a.score;
    });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600">
            Manage and share your earned certificates
          </p>
        </div>

        {/* Stats */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <p className="text-4xl font-bold text-blue-600">
                {certificates.length}
              </p>
              <p className="text-gray-600">Total Certificates</p>
            </Card>
            <Card className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {certificates.filter((c) => c.status === 'issued').length}
              </p>
              <p className="text-gray-600">Active</p>
            </Card>
            <Card className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {(
                  certificates.reduce((sum, c) => sum + (c.score || 0), 0) /
                  certificates.length
                ).toFixed(0)}
                %
              </p>
              <p className="text-gray-600">Average Score</p>
            </Card>
          </div>
        )}

        {/* Controls */}
        <Card className="mb-8">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="revoked">Revoked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="course">Course Name</option>
              <option value="score">Highest Score</option>
            </select>

            <Button
              onClick={() => setShowVerifyModal(true)}
              variant="outline"
            >
              Verify Certificate
            </Button>
          </div>
        </Card>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert._id}
                className="border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedCertificate(cert)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {cert.instructor || 'Instructor'}
                      </p>
                    </div>
                    <Badge variant={statusColors[cert.status] || 'gray'}>
                      {cert.status}
                    </Badge>
                  </div>

                  {/* Certificate Info */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Certificate Number</span>
                      <span className="text-sm font-mono font-bold">
                        {cert.certificateNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {cert.score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Issued Date</span>
                      <span className="text-sm">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {cert.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires</span>
                        <span className="text-sm">
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Skills Gained
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCertificate(cert._id);
                      }}
                      variant="primary"
                      size="sm"
                      fullWidth
                      loading={downloading}
                    >
                      📥 Download PDF
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareCertificate(cert.certificateNumber);
                      }}
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      🔗 Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-600 text-lg mb-4">
              No certificates earned yet
            </p>
            <p className="text-gray-500 text-sm">
              Complete courses and pass certification exams to earn certificates
            </p>
          </Card>
        )}
      </div>

      {/* Certificate Detail Modal */}
      <Modal
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        title="Certificate Details"
      >
        {selectedCertificate && (
          <div className="space-y-6">
            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {selectedCertificate.courseTitle}
              </h2>
              <p className="text-blue-700 text-lg">
                Score: {selectedCertificate.score}%
              </p>
              <p className="text-sm text-blue-600 mt-4">
                Certificate #{selectedCertificate.certificateNumber}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Instructor</span>
                <span className="font-semibold">
                  {selectedCertificate.instructor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issued Date</span>
                <span className="font-semibold">
                  {new Date(selectedCertificate.issueDate).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </span>
              </div>
              {selectedCertificate.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires</span>
                  <span className="font-semibold">
                    {new Date(selectedCertificate.expiryDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  handleDownloadCertificate(selectedCertificate._id)
                }
                variant="primary"
                fullWidth
                loading={downloading}
              >
                📥 Download PDF
              </Button>
              <Button
                onClick={() =>
                  handleShareCertificate(selectedCertificate.certificateNumber)
                }
                variant="outline"
                fullWidth
              >
                🔗 Copy Link
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Certificate Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setVerifyCode('');
          setVerificationResult(null);
        }}
        title="Verify Certificate"
      >
        <form onSubmit={handleVerifyCertificate} className="space-y-4">
          <p className="text-gray-600">
            Enter a certificate number to verify its authenticity
          </p>

          <input
            type="text"
            placeholder="e.g., CERT-1234567890-ABC123"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {verificationResult && (
            <Alert
              type="success"
              message={`✓ Certificate verified: ${verificationResult.studentName} - ${verificationResult.courseTitle}`}
            />
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button type="submit" variant="primary">
              Verify
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CertificateManagementPage;
