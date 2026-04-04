// components/vehicles/VehicleDocumentsList.jsx
import { useState } from 'react';
import { Eye, Upload, Trash2, Download, X, FileText, Image, File, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { moduleApi } from '../../../services/api';

export default function VehicleDocumentsList({ documents, vehicleId, onUpdate, selectedVehicle }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploading, setUploading] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleReupload = async (document, file) => {
    setUploading(prev => ({ ...prev, [document.id]: true }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      await moduleApi.update(`/vehicles/documents/${document.id}`, formData);
      toast.success('Document updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update document');
    } finally {
      setUploading(prev => ({ ...prev, [document.id]: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await moduleApi.remove('/vehicles/documents', id);
      toast.success('Document deleted successfully');
      setShowDeleteConfirm(null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileType = (url) => {
    const extension = url?.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) return 'image';
    return 'other';
  };

  const getDocumentIcon = (doc) => {
    const fileType = getFileType(doc.file_url);
    if (fileType === 'pdf') return <FileText size={40} className="text-red-500" />;
    if (fileType === 'image') return <Image size={40} className="text-blue-500" />;
    return <File size={40} className="text-gray-500" />;
  };

  const getStatusColor = (expiryDate) => {
    if (!expiryDate) return 'text-gray-500';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'text-red-600 bg-red-50';
    if (daysLeft < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (expiryDate) => {
    if (!expiryDate) return 'No expiry date';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
  };

  // Document Preview Modal
  const DocumentPreviewModal = ({ doc, onClose }) => {
    const fileType = getFileType(doc?.file_url);
    const isImage = fileType === 'image';
    const isPdf = fileType === 'pdf';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
        <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 capitalize">
                {doc?.document_type?.replace(/_/g, ' ')}
              </h3>
              {doc?.document_number && (
                <p className="text-sm text-slate-500">#{doc.document_number}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
            {isImage ? (
              <img
                src={doc?.file_url}
                alt={doc?.document_type}
                className="max-w-full h-auto mx-auto rounded-lg"
              />
            ) : isPdf ? (
              <iframe
                src={`${doc?.file_url}#toolbar=1`}
                className="w-full h-[70vh] rounded-lg"
                title={doc?.document_type}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                {getDocumentIcon(doc)}
                <p className="mt-4 text-slate-600">This file type cannot be previewed directly.</p>
                <a
                  href={doc?.file_url}
                  download
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Download size={16} />
                  Download File
                </a>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              {doc?.expiry_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <a
              href={doc?.file_url}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ doc, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <div className="relative max-w-md w-full bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Document</h3>
          <p className="text-slate-500 mb-6">
            Are you sure you want to delete "{doc?.document_type?.replace(/_/g, ' ')}" document? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(doc.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <FileText size={48} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Documents</h3>
        <p className="text-sm text-slate-500">
          No documents have been uploaded for this vehicle yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Vehicle Documents</h3>
            {selectedVehicle && (
              <p className="text-sm text-slate-500 mt-1">
                {selectedVehicle.registration_no} - {selectedVehicle.car_make} {selectedVehicle.car_model}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  {/* Document Icon */}
                  <div className="flex-shrink-0">
                    {getDocumentIcon(doc)}
                  </div>
                  
                  {/* Document Info */}
                  <div>
                    <h4 className="font-semibold text-slate-900 capitalize">
                      {doc.document_type.replace(/_/g, ' ')}
                    </h4>
                    {doc.document_number && (
                      <p className="text-sm text-slate-500 mt-0.5">Number: {doc.document_number}</p>
                    )}
                    {doc.issue_date && (
                      <p className="text-xs text-slate-400 mt-1">
                        Issued: {new Date(doc.issue_date).toLocaleDateString()}
                      </p>
                    )}
                    {doc.expiry_date && (
                      <p className={`text-xs mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getStatusColor(doc.expiry_date)}`}>
                        <Calendar size={10} />
                        {getStatusText(doc.expiry_date)}
                      </p>
                    )}
                    {doc.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">{doc.notes}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 rounded-lg border hover:bg-slate-50 transition-colors group"
                    title="View Document"
                  >
                    <Eye size={16} className="group-hover:text-primary-600" />
                  </button>
                  <label className="p-2 rounded-lg border hover:bg-slate-50 cursor-pointer transition-colors relative group">
                    <Upload size={16} className={uploading[doc.id] ? 'animate-spin' : 'group-hover:text-primary-600'} />
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleReupload(doc, e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      disabled={uploading[doc.id]}
                    />
                  </label>
                  <button
                    onClick={() => setShowDeleteConfirm(doc)}
                    className="p-2 rounded-lg border hover:bg-red-50 hover:text-red-600 transition-colors group"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          doc={showDeleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </>
  );
}