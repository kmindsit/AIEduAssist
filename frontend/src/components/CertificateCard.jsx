import React from 'react';
import { Download, Share2, Award } from 'lucide-react';
import Button from './Button';

export default function CertificateCard({ certificate, onDownload, onShare }) {
  const issueDate = new Date(certificate.issueDate).toLocaleDateString();
  const expiryDate = certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : 'No expiry';

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg shadow-md p-6 max-w-sm">
      <div className="text-center mb-4">
        <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
        <h3 className="text-xl font-bold text-gray-800">Certificate of Completion</h3>
      </div>

      <div className="border-t-2 border-b-2 border-dashed border-yellow-300 py-4 mb-4 text-center">
        <p className="text-sm text-gray-600">This certifies that</p>
        <p className="text-lg font-semibold text-gray-800 mt-1">Achievement Unlocked</p>
        <p className="text-sm text-gray-600 mt-2">has successfully completed the course</p>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Certificate ID:</span>
          <span className="font-mono text-gray-800">{certificate.id.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Issued:</span>
          <span className="text-gray-800">{issueDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expires:</span>
          <span className="text-gray-800">{expiryDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
            {certificate.status === 'active' ? 'Active' : certificate.status}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={onDownload}
          fullWidth
          className="flex items-center justify-center"
        >
          <Download className="w-4 h-4 mr-1" /> Download PDF
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShare}
          className="flex items-center justify-center"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
