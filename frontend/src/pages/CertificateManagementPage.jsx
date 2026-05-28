import React, { useState, useEffect } from 'react';
import { Download, Share2, Eye, Filter, Trash2 } from 'lucide-react';
import certificateService from '../services/certificateService';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import CertificateCard from '../components/CertificateCard';

const CertificateManagementPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getUserCertificates({ sort: sortBy, status: filterStatus });
      setCertificates(data);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      setDownloading(true);
      const blob = await certificateService.downloadCertificatePDF(certificateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Failed to download certificate:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareCertificate = (certificateNumber) => {
    const url = `${window.location.origin}/verify/${certificateNumber}`;
    navigator.clipboard.writeText(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">Manage and share your earned certificates</p>
        </div>

        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{certificates.length}</p>
              <p className="text-gray-600 text-sm mt-1">Total</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{certificates.filter(c => c.status === 'issued').length}</p>
              <p className="text-gray-600 text-sm mt-1">Active</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">{Math.round((certificates.reduce((sum, c) => sum + (c.score || 0), 0)) / certificates.length)}%</p>
              <p className="text-gray-600 text-sm mt-1">Avg Score</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">{certificates.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length}</p>
              <p className="text-gray-600 text-sm mt-1">Valid</p>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <div className="flex gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </Card>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onView={() => {
                  setSelectedCertificate(cert);
                  setShowDetailModal(true);
                }}
                onDownload={() => handleDownloadCertificate(cert.id)}
                onShare={() => handleShareCertificate(cert.certificateNumber)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-600 text-lg">No certificates earned yet</p>
          </Card>
        )}
      </div>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Certificate Details">
        {selectedCertificate && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{selectedCertificate.courseTitle}</h2>
              <p className="text-blue-700 text-lg font-semibold">Score: {selectedCertificate.score}%</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  handleDownloadCertificate(selectedCertificate.id);
                  setShowDetailModal(false);
                }}
                fullWidth
                loading={downloading}
              >
                <Download className="mr-2 inline" size={16} />Download PDF
              </Button>
              <Button
                onClick={() => {
                  handleShareCertificate(selectedCertificate.certificateNumber);
                  setShowDetailModal(false);
                }}
                variant="outline"
                fullWidth
              >
                <Share2 className="mr-2 inline" size={16} />Share
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificateManagementPage;
