// OwnerDocumentList.jsx - Enhanced with Customer Document List features
import useFetch from '../../hooks/useFetch';
import { Eye, Upload, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { moduleApi } from '../../services/api';

export default function OwnerDocumentList({ ownerId, onDocumentUpdated }) {
  const { data, loading, refetch } = useFetch(`/owners/${ownerId}/documents`);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [optimisticUpdates, setOptimisticUpdates] = useState({});
  const fileInputRef = useRef(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Allowed file types and max size
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!file) return "No file selected";

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, JPG, or WEBP images are allowed";
    }

    if (file.size > MAX_SIZE) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  // Transform API response (array) to match the expected document structure
  const transformDocuments = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_url: doc.file_url,
      is_verified: doc.is_verified === 1,
      rejection_reason: doc.rejection_reason,
      extracted_text: doc.extracted_data ? JSON.stringify(JSON.parse(doc.extracted_data), null, 2) : null,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
  };

  const documents = transformDocuments(data);

  const handleReupload = async (document, file) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Create object URL for optimistic update
    const optimisticImageUrl = URL.createObjectURL(file);
    
    // Set optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [document.id]: {
        isUploading: true,
        progress: 0,
        tempImageUrl: optimisticImageUrl
      }
    }));

    setUploadProgress(prev => ({ ...prev, [document.id]: true }));

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setOptimisticUpdates(prev => {
        if (!prev[document.id]?.isUploading) {
          clearInterval(progressInterval);
          return prev;
        }
        const currentProgress = prev[document.id]?.progress || 0;
        if (currentProgress < 90) {
          return {
            ...prev,
            [document.id]: {
              ...prev[document.id],
              progress: Math.min(currentProgress + 10, 90)
            }
          };
        }
        return prev;
      });
    }, 200);

    try {
      const formData = new FormData();
      
      // Parse document type to determine document_type and side
      let docType = '';
      let docSide = null;
      
      if (document.document_type === 'cnic_front') {
        docType = 'cnic_front';
        docSide = 'front';
      } else if (document.document_type === 'cnic_back') {
        docType = 'cnic_back';
        docSide = 'back';
      } else if (document.document_type === 'driving_license') {
        docType = 'driving_license';
        docSide = 'front';
      } else if (document.document_type === 'driving_license_back') {
        docType = 'driving_license';
        docSide = 'back';
      }
      
      formData.append("document_type", docType);
      if (docSide) formData.append("document_side", docSide);
      formData.append("images", file);

      await moduleApi.create(`/owners/${ownerId}/documents`, formData);

      // Complete progress
      setOptimisticUpdates(prev => ({
        ...prev,
        [document.id]: {
          ...prev[document.id],
          progress: 100
        }
      }));

      toast.success(`${document.document_type.replace(/_/g, " ")} re-uploaded successfully`);
      
      // Wait a moment to show 100% before refreshing
      setTimeout(async () => {
        await refetch();
        onDocumentUpdated?.();
        // Clean up object URL
        URL.revokeObjectURL(optimisticImageUrl);
      }, 500);
      
    } catch (error) {
      console.error("Reupload error:", error);
      toast.error(error.response?.data?.message || "Failed to re-upload document");
      // Remove optimistic update on error
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[document.id];
        return newState;
      });
      URL.revokeObjectURL(optimisticImageUrl);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [document.id]: false }));
      setSelectedDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = (document) => {
    setSelectedDocument(document);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedDocument) {
      handleReupload(selectedDocument, file);
    }
  };

  const getDocumentImageUrl = (doc) => {
    const optimistic = optimisticUpdates[doc.id];
    if (optimistic?.isUploading && optimistic.tempImageUrl) {
      return optimistic.tempImageUrl;
    }
    return doc.file_url;
  };

  const getUploadProgress = (docId) => {
    return optimisticUpdates[docId]?.progress || 0;
  };

  const isUploading = (docId) => {
    return optimisticUpdates[docId]?.isUploading || false;
  };

  // Get display name for document type
  const getDocumentDisplayName = (documentType) => {
    const names = {
      'cnic_front': 'CNIC Front',
      'cnic_back': 'CNIC Back',
      'driving_license_front': 'Driving License Front',
      'driving_license_back': 'Driving License Back'
    };
    return names[documentType] || documentType.replace(/_/g, " ");
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Owner Documents</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* GRID */}
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No documents uploaded yet</p>
          <p className="text-xs text-gray-400 mt-2">Required: CNIC Front, CNIC Back, Driving License</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => {
            const uploading = isUploading(doc.id);
            const progress = getUploadProgress(doc.id);
            const imageUrl = getDocumentImageUrl(doc);

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border p-3 shadow hover:shadow-md transition-all duration-200 ${
                  uploading ? 'opacity-90' : ''
                }`}
              >
                {/* IMAGE SECTION */}
                <div className="relative group">
                  {/* Image Container */}
                  <div className="relative h-42 w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={doc.document_type}
                      className={`h-full w-full object-cover transition-all duration-300 ${
                        uploading ? 'scale-105' : ''
                      }`}
                      onError={(e) => {
                        if (!uploading) {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }
                      }}
                    />

                    {/* Upload Overlay with Progress */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        {/* Spinner */}
                        <div className="relative mb-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{progress}%</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-3/4 bg-white/30 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-white text-xs mt-2 font-medium">
                          {progress === 100 ? 'Finalizing...' : 'Uploading...'}
                        </p>
                      </div>
                    )}

                    {/* Loading Skeleton for initial load */}
                    {!imageUrl && !uploading && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <Upload size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* PREVIEW BUTTON - Hide during upload */}
                  {!uploading && (
                    <button
                      onClick={() => setPreview(doc.file_url)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
                      title="Preview image"
                    >
                      <Eye size={16} className="text-gray-700" />
                    </button>
                  )}

                  {/* RE-UPLOAD OVERLAY FOR UNVERIFIED DOCUMENTS */}
                  {!doc.is_verified && !uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => triggerFileInput(doc)}
                        disabled={uploadProgress[doc.id]}
                        className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Upload size={16} />
                        Re-upload
                      </button>
                    </div>
                  )}
                </div>

                {/* DOCUMENT TYPE */}
                <div className="mt-2">
                  <div className="text-sm font-medium capitalize text-gray-800 flex items-center justify-between">
                    <span>{getDocumentDisplayName(doc.document_type)}</span>
                    {uploading && (
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="mt-1">
                  {doc.is_verified ? (
                    <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <CheckCircle size={12} className="mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      <AlertCircle size={12} className="mr-1" />
                      Rejected
                    </span>
                  )}
                </div>

                {/* REJECTION REASON */}
                {!doc.is_verified && doc.rejection_reason && !uploading && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600">
                      <span className="font-semibold">Rejected:</span> {doc.rejection_reason}
                    </p>
                    {doc.extracted_text && doc.extracted_text !== '{}' && (
                      <details className="mt-1">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show extracted text</summary>
                        <p className="text-xs text-gray-600 mt-1 p-1 bg-gray-100 rounded break-words max-h-32 overflow-y-auto">
                          {doc.extracted_text}
                        </p>
                      </details>
                    )}
                  </div>
                )}

                {/* RE-UPLOAD NOTE FOR UNVERIFIED DOCUMENTS */}
                {!doc.is_verified && !uploading && (
                  <div className="mt-2 pt-1">
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Upload size={10} />
                      Click "Re-upload" to submit a new image
                    </p>
                  </div>
                )}

                {/* Uploading Status Message */}
                {uploading && (
                  <div className="mt-2 pt-1">
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div>
                      Uploading new document...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={preview}
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
              alt="Document preview"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}