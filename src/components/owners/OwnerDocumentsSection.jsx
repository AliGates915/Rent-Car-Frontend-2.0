// OwnerDocumentsSection.jsx - Fixed to work with array response
import { useState, useMemo } from "react";
import useFetch from '../../hooks/useFetch';
import OwnerDocumentUploadDrawer from './OwnerDocumentUploadDrawer';
import OwnerDocumentList from './OwnerDocumentList';

export default function OwnerDocumentsSection({ selectedOwner, onUpdate }) {
  const [openUpload, setOpenUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadType, setUploadType] = useState(null);

  // Fetch documents for the selected owner (returns an array of documents)
  const { data: ownerDocuments, refetch: refetchDocuments } = useFetch(
    selectedOwner ? `/owners/${selectedOwner.id}/documents` : null,
    { depends: [selectedOwner, refreshKey] }
  );

  // console.log("ownerDocuments (array):", ownerDocuments);

  // Transform the array of documents into the expected format for checking
  const getUploadedDocumentTypes = useMemo(() => {
    if (!ownerDocuments || !Array.isArray(ownerDocuments)) return [];
    
    const uploaded = [];
    ownerDocuments.forEach(doc => {
      if (doc.document_type === 'cnic_front') uploaded.push('cnic_front');
      if (doc.document_type === 'cnic_back') uploaded.push('cnic_back');
      if (doc.document_type === 'driving_license' ) {
          uploaded.push('driving_license');
      }
    });
    
    return uploaded;
  }, [ownerDocuments]);

  const REQUIRED_DOCUMENTS = ['cnic_front', 'cnic_back', 'driving_license'];
  
  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    docType => !getUploadedDocumentTypes.includes(docType)
  );
  const allRequiredDocsUploaded = missingDocuments.length === 0;

  // Get existing document types for the upload drawer
  const existingDocuments = useMemo(() => {
    if (!ownerDocuments || !Array.isArray(ownerDocuments)) return [];
    return ownerDocuments.map(doc => doc.document_type);
  }, [ownerDocuments]);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    refetchDocuments();
    setUploadType(null);
    if (onUpdate) onUpdate();
  };

  const handleDocumentUpdated = () => {
    setRefreshKey(prev => prev + 1);
    refetchDocuments();
    if (onUpdate) onUpdate();
  };

  const handleUploadClick = (docType = null) => {
    setUploadType(docType);
    setOpenUpload(true);
  };

  if (!selectedOwner) {
    return null;
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4">
      {/* DOCUMENT SECTION */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              Documents for: <span className="text-primary-600">{selectedOwner.owner_name || selectedOwner.name}</span>
            </h3>
            
            {allRequiredDocsUploaded ? (
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ All Required Documents Uploaded
              </span>
            ) : (
              <div className="mt-1 text-sm text-amber-600">
                Missing: {missingDocuments.map(d => {
                  const names = {
                    cnic_front: 'CNIC Front',
                    cnic_back: 'CNIC Back',
                    driving_license: 'Driving License'
                  };
                  return names[d];
                }).join(', ')}
              </div>
            )}
          </div>

          {!allRequiredDocsUploaded ? (
            <button
              onClick={() => handleUploadClick()}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              + Upload Document
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-white px-5 py-2 rounded-lg cursor-not-allowed"
            >
              ✓ All Documents Complete
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENT LIST - Pass the array directly */}
      <OwnerDocumentList 
        ownerId={selectedOwner.id}
        key={refreshKey}
        onDocumentUpdated={handleDocumentUpdated}
      />

      {/* UPLOAD DRAWER */}
      {openUpload && (
        <OwnerDocumentUploadDrawer
          ownerId={selectedOwner?.id}
          onClose={() => {
            setOpenUpload(false);
            setUploadType(null);
          }}
          onSuccess={handleUploadSuccess}
          existingDocuments={existingDocuments}
          defaultDocumentType={uploadType}
        />
      )}
    </div>
  );
}