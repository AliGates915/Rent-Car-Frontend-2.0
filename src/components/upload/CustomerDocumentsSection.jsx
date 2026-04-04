import { useState } from "react";
import useFetch from '../../hooks/useFetch';
import DocumentUploadDrawer from './DocumentUploadDrawer';
import DocumentList from './DocumentList';

export default function CustomerDocumentsSection() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: customers } = useFetch("/customers");
  const { data: documents, refetch: refetchDocuments } = useFetch(
    selectedCustomer ? `/customers/${selectedCustomer.id}/documents` : null,
    { depends: [selectedCustomer, refreshKey] }
  );

  const REQUIRED_DOCUMENTS = ['cnic_front', 'cnic_back', 'driving_license'];
  
  const getUploadedDocumentTypes = () => {
    if (!documents) return [];
    return documents.map(doc => doc.document_type);
  };

  const uploadedTypes = getUploadedDocumentTypes();
  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    docType => !uploadedTypes.includes(docType)
  );
  const allRequiredDocsUploaded = missingDocuments.length === 0;

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    refetchDocuments();
  };

  const handleDocumentUpdated = () => {
    setRefreshKey(prev => prev + 1);
    refetchDocuments();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4">

      {/* SELECT */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Customer
        </label>
        <select
          value={selectedCustomer?.id || ""}
          onChange={(e) => {
            const customer = customers?.find(c => c.id == e.target.value);
            setSelectedCustomer(customer);
            setRefreshKey(prev => prev + 1);
          }}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="">Select Customer</option>
          {customers?.map(c => (
            <option key={c.id} value={c.id}>
              {c.customer_name}
            </option>
          ))}
        </select>
      </div>

      {/* DOCUMENT SECTION */}
      {selectedCustomer && (
        <>
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Documents for: <span className="text-primary-600">{selectedCustomer.customer_name}</span>
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
                  onClick={() => setOpenUpload(true)}
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

          {/* DOCUMENT LIST */}
          <DocumentList 
            customerId={selectedCustomer.id} 
            key={refreshKey}
            onDocumentUpdated={handleDocumentUpdated}
          />
        </>
      )}

      {/* UPLOAD DRAWER */}
      {openUpload && (
        <DocumentUploadDrawer
          customerId={selectedCustomer?.id}
          onClose={() => setOpenUpload(false)}
          onSuccess={handleUploadSuccess}
          existingDocuments={uploadedTypes}
        />
      )}
    </div>
  );
}