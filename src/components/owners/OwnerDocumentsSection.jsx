// components/owners/OwnerDocumentsSection.jsx
import { useState, useEffect } from 'react';
import { Upload, Eye, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { moduleApi } from '../../services/api';

export default function OwnerDocumentsSection({ ownerId, ownerName, onUpdate }) {
  const [documents, setDocuments] = useState({
    cnic_front: null,
    cnic_back: null,
    driving_license_front: null,
    driving_license_back: null
  });
  const [verificationStatus, setVerificationStatus] = useState({});
  const [loading, setLoading] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerDocuments();
    }
  }, [ownerId]);

  const fetchOwnerDocuments = async () => {
    setFetching(true);
    try {
      const response = await moduleApi.getById('/owners', ownerId);
      const ownerData = response.data;
      
      setDocuments({
        cnic_front: ownerData.cnic_front_url,
        cnic_back: ownerData.cnic_back_url,
        driving_license_front: ownerData.driving_license_front_url,
        driving_license_back: ownerData.driving_license_back_url
      });
      
      setVerificationStatus({
        cnic: ownerData.cnic_is_verified,
        driving_license: ownerData.driving_license_is_verified,
        cnic_rejection: ownerData.cnic_rejection_reason,
        license_rejection: ownerData.driving_license_rejection_reason
      });
    } catch (error) {
      console.error('Error fetching owner documents:', error);
      toast.error('Failed to load owner documents');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (documentType, side, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setLoading(prev => ({ ...prev, [`${documentType}_${side}`]: true }));

    const formData = new FormData();
    formData.append('document', file);
    formData.append('side', side);

    try {
      const endpoint = documentType === 'cnic' 
        ? `/owners/${ownerId}/upload-cnic`
        : `/owners/${ownerId}/upload-driving-license`;
      
      const response = await moduleApi.create(endpoint, formData);
      
      setDocuments(prev => ({
        ...prev,
        [`${documentType}_${side}`]: response.data.fileUrl
      }));
      
      setVerificationStatus(prev => ({
        ...prev,
        [documentType]: response.data.isValid,
        [`${documentType}_rejection`]: response.data.errors?.join(', ')
      }));
      
      if (response.data.isValid) {
        toast.success(`${documentType === 'cnic' ? 'CNIC' : 'License'} ${side} uploaded and verified`);
      } else {
        toast.warning(`${documentType === 'cnic' ? 'CNIC' : 'License'} ${side} uploaded but verification failed`);
      }
      
      onUpdate?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(prev => ({ ...prev, [`${documentType}_${side}`]: false }));
    }
  };

  const DocumentCard = ({ title, type, side, url, isVerified, rejectionReason, onUpload }) => {
    const isLoading = loading[`${type}_${side}`];
    const hasDocument = !!url;

    return (
      <div className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          {hasDocument && (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isVerified ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
              {isVerified ? 'Verified' : 'Rejected'}
            </span>
          )}
        </div>

        <div className="relative">
          {hasDocument ? (
            <div className="relative group">
              <img src={url} alt={title} className="w-full h-32 object-cover rounded-lg cursor-pointer" onClick={() => setPreviewImage(url)} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button onClick={() => setPreviewImage(url)} className="p-2 bg-white rounded-full hover:bg-gray-100"><Eye size={16} /></button>
                <label className="p-2 bg-white rounded-full hover:bg-gray-100 cursor-pointer">
                  <Upload size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <Upload size={24} className="text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">Upload {title}</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e.target.files[0])} disabled={isLoading} />
            </label>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {rejectionReason && !isVerified && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600"><span className="font-semibold">Rejected:</span> {rejectionReason}</p>
          </div>
        )}
      </div>
    );
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-3 text-slate-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900">Owner Documents</h3>
          <button onClick={fetchOwnerDocuments} className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><RefreshCw size={16} /></button>
        </div>
        <p className="text-sm text-slate-500 mb-6">Upload CNIC (front & back) and Driving License (front & back) for {ownerName || 'Owner'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 border-b pb-2">CNIC Documents</h4>
            <DocumentCard title="CNIC Front" type="cnic" side="front" url={documents.cnic_front} isVerified={verificationStatus.cnic} rejectionReason={verificationStatus.cnic_rejection} onUpload={(file) => handleFileUpload('cnic', 'front', file)} />
            <DocumentCard title="CNIC Back" type="cnic" side="back" url={documents.cnic_back} isVerified={verificationStatus.cnic} rejectionReason={verificationStatus.cnic_rejection} onUpload={(file) => handleFileUpload('cnic', 'back', file)} />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 border-b pb-2">Driving License Documents</h4>
            <DocumentCard title="License Front" type="driving_license" side="front" url={documents.driving_license_front} isVerified={verificationStatus.driving_license} rejectionReason={verificationStatus.license_rejection} onUpload={(file) => handleFileUpload('driving_license', 'front', file)} />
            <DocumentCard title="License Back" type="driving_license" side="back" url={documents.driving_license_back} isVerified={verificationStatus.driving_license} rejectionReason={verificationStatus.license_rejection} onUpload={(file) => handleFileUpload('driving_license', 'back', file)} />
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full">
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}