// components/vehicles/VehicleDocumentsManager.jsx
import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import VehicleSelector from './VehicleSelector';
import VehicleDocumentsForm from './VehicleDocumentsForm';
import VehicleDocumentsList from './VehicleDocumentsList';

export default function VehicleDocumentsManager() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Fetch documents for selected vehicle
  const { data: vehicleDocs, loading, refetch } = useFetch(
    selectedVehicle ? `/vehicles/${selectedVehicle.id}/documents` : null,
    {},
    !!selectedVehicle
  );

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const hasDocuments = vehicleDocs && vehicleDocs.length > 0;

  return (
    <div className="space-y-6">
      {/* Step 1: Select Vehicle */}
      <VehicleSelector onSelect={handleVehicleSelect} selectedVehicle={selectedVehicle} />
      
      {/* Step 2: Show Documents or Form */}
      {selectedVehicle && (
        <>
          {!loading && hasDocuments ? (
            <VehicleDocumentsList 
              documents={vehicleDocs} 
              vehicleId={selectedVehicle.id}
              onUpdate={refetch}
              selectedVehicle={selectedVehicle}
            />
          ) : !loading && !hasDocuments ? (
            <VehicleDocumentsForm 
              vehicleId={selectedVehicle.id}
              vehicleRegNo={selectedVehicle.registration_no}
              onSuccess={refetch}
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-slate-500">Loading documents...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}