// OwnerDocumentUploadDrawer.jsx - Updated to use unified endpoint

import { useState, useCallback, useRef } from "react";
import { moduleApi } from "../../services/api";
import toast from "react-hot-toast";

export default function OwnerDocumentUploadDrawer({ 
  ownerId,  
  onClose, 
  onSuccess,
  existingDocuments = [],
  defaultDocumentType = null
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState(defaultDocumentType || "");
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  // Allowed file types and max size (5MB)
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const documentNames = {
    cnic_front: 'CNIC Front',
    cnic_back: 'CNIC Back',
    driving_license: 'Driving License',
  };

  // Map frontend document types to backend expected values
  const getBackendDocumentType = (docType) => {
    if (docType === 'cnic_front') {
      return 'cnic_front';
    }
    if ( docType === 'cnic_back') {
      return 'cnic_back';
    }
    if (docType === 'driving_license') {
      return 'driving_license';
    }
    return '';
  };


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

  const handleFile = useCallback((e) => {
    const selectedFile = e.target.files[0];
    setValidationError("");
    
    if (!selectedFile) return;
    
    const error = validateFile(selectedFile);
    
    if (error) {
      setValidationError(error);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError("");
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    const error = validateFile(droppedFile);
    
    if (error) {
      setValidationError(error);
      setFile(null);
      setPreview(null);
      return;
    }
    
    setFile(droppedFile);
    setPreview(URL.createObjectURL(droppedFile));
  };

  // Check if document type is already uploaded
  const isDocumentAlreadyUploaded = (docType) => {
    return existingDocuments.includes(docType);
  };

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    setValidationError("");
    
    // Check if document already exists
    if (isDocumentAlreadyUploaded(selectedType)) {
      setValidationError(`This document (${documentNames[selectedType]}) has already been uploaded for this owner.`);
    }
  };

  // Upload document using unified endpoint
  const handleUpload = async () => {
    setValidationError("");
    
    // Validation checks
    if (!type) {
      setValidationError("Please select a document type");
      return;
    }
    
    // Check if document already exists
    if (isDocumentAlreadyUploaded(type)) {
      setValidationError(`Document "${documentNames[type]}" has already been uploaded. Cannot upload duplicate.`);
      return;
    }
    
    if (!file) {
      setValidationError("Please select an image file to upload");
      return;
    }
    
    const fileError = validateFile(file);
    if (fileError) {
      setValidationError(fileError);
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      // Get backend document type and side
      const documentType = getBackendDocumentType(type);
      
      // Append to form data as expected by backend
      formData.append("document_type", documentType);
      formData.append("images", file); // 'images' as expected by upload.single("images")
      
      

      // Use the unified endpoint
      await moduleApi.create(
        `/owners/${ownerId}/documents`,
        formData
      );
      
      toast.success(`${documentNames[type]} uploaded successfully`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
      setValidationError(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setValidationError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filter out already uploaded documents from options
  const getAvailableDocumentOptions = () => {
    const allOptions = [
      { value: "cnic_front", label: "CNIC Front", required: true },
      { value: "cnic_back", label: "CNIC Back", required: true },
      { value: "driving_license", label: "Driving License", required: true },
    ];
    
    return allOptions.map(option => ({
      ...option,
      disabled: existingDocuments.includes(option.value),
      uploaded: existingDocuments.includes(option.value)
    }));
  };

  const availableOptions = getAvailableDocumentOptions();
  const allRequiredUploaded = ['cnic_front', 'cnic_back', 'driving_license'].every(
    doc => existingDocuments.includes(doc)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />

      {/* MODAL - Centered */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5 animate-modal-slide-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Upload Owner Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Message */}
        {allRequiredUploaded && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            ✓ All required documents have been uploaded successfully!
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {/* Document Type Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            disabled={!!defaultDocumentType}
          >
            <option value="">Select Document Type</option>
            {availableOptions.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label} {option.required && "(Required)"} {option.uploaded && "✓ Uploaded"}
              </option>
            ))}
          </select>
          {type && isDocumentAlreadyUploaded(type) && (
            <p className="text-xs text-red-500 mt-1">
              This document has already been uploaded
            </p>
          )}
        </div>

        {/* Drop Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Upload Image <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              preview 
                ? "border-green-300 bg-green-50" 
                : validationError 
                ? "border-red-300 bg-red-50" 
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              hidden
              onChange={handleFile}
            />
            
            {!preview ? (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-gray-600">
                  <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, JPG, or WEBP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">✓ File selected: {file?.name}</p>
                <p className="text-xs text-gray-500">
                  {(file?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm font-medium text-gray-700">Preview</label>
            <div className="relative group">
              <img
                src={preview}
                alt="Document preview"
                className="w-full h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
              />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleUpload}
            disabled={isUploading || !file || !type || isDocumentAlreadyUploaded(type)}
            className={`
              flex-1 px-4 py-2.5 rounded-xl font-medium transition-all
              ${isUploading || !file || !type || isDocumentAlreadyUploaded(type)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700 active:scale-98 shadow-md hover:shadow-lg"
              }
            `}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              "Confirm Upload"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2 border-t">
          Required documents: CNIC Front, CNIC Back, and Driving License
        </p>
      </div>

      <style jsx>{`
        @keyframes modal-slide-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-slide-in {
          animation: modal-slide-in 0.2s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}