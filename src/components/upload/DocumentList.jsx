import useFetch from '../../hooks/useFetch';
import { Eye, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { moduleApi } from '../../services/api';

export default function DocumentList({ customerId, onDocumentUpdated }) {
  const { data, loading, refetch } = useFetch(`/customers/${customerId}/documents`);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
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

  const handleReupload = async (document, file) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadProgress(prev => ({ ...prev, [document.id]: true }));

    try {
      const formData = new FormData();
      formData.append("document_type", document.document_type);
      formData.append("images", file);

      for (let pair of formData.entries()) {
        console.log(pair);
      }
      await moduleApi.create(`/customers/${customerId}/documents`, formData);

      toast.success(`${document.document_type.replace("_", " ")} re-uploaded successfully`);
      await refetch();
      onDocumentUpdated?.();
    } catch (error) {
      console.error("Reupload error:", error);
      toast.error(error.response?.data?.message || "Failed to re-upload document");
    } finally {
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
        <h2 className="text-lg font-semibold text-gray-800">Customer Documents</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Refresh
        </button>
      </div>

      {/* GRID */}
      {data?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border p-3 shadow hover:shadow-md transition-all duration-200"
            >
              {/* IMAGE SECTION */}
              <div className="relative group">
                <img
                  src={doc.file_url}
                  alt={doc.document_type}
                  className="h-32 w-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />

                {/* PREVIEW BUTTON */}
                <button
                  onClick={() => setPreview(doc.file_url)}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
                  title="Preview image"
                >
                  <Eye size={16} className="text-gray-700" />
                </button>

                {/* RE-UPLOAD OVERLAY FOR UNVERIFIED DOCUMENTS */}
                {!doc.is_verified && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => triggerFileInput(doc)}
                      disabled={uploadProgress[doc.id]}
                      className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {uploadProgress[doc.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Re-upload
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* DOCUMENT TYPE */}
              <div className="mt-2">
                <div className="text-sm font-medium capitalize text-gray-800">
                  {doc.document_type.replace(/_/g, " ")}
                </div>
              </div>

              {/* STATUS BADGE */}
              <div className="mt-1">
                {doc.is_verified ? (
                  <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></span>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1"></span>
                    Rejected
                  </span>
                )}
              </div>

              {/* REJECTION REASON */}
              {!doc.is_verified && doc.rejection_reason && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">
                    <span className="font-semibold">Rejected:</span> {doc.rejection_reason}
                  </p>
                  {doc.extracted_text && (
                    <details className="mt-1">
                      <summary className="text-xs text-gray-500 cursor-pointer">Show extracted text</summary>
                      <p className="text-xs text-gray-600 mt-1 p-1 bg-gray-100 rounded">
                        {doc.extracted_text.substring(0, 200)}...
                      </p>
                    </details>
                  )}
                </div>
              )}

              {/* RE-UPLOAD NOTE FOR UNVERIFIED DOCUMENTS */}
              {!doc.is_verified && (
                <div className="mt-2 pt-1">
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Upload size={10} />
                    Click "Re-upload" to submit a new image
                  </p>
                </div>
              )}
            </div>
          ))}
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

      {/* Add custom styles for line-clamp if not using Tailwind CSS plugin */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}