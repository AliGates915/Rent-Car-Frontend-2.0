// components/owners/OwnerDocumentsManager.jsx
import { useState } from 'react';
import OwnerSelector from './OwnerSelector';
import OwnerDocumentsSection from './OwnerDocumentsSection';
import { AlertCircle } from 'lucide-react';

export default function OwnerDocumentsManager({ onUpdate }) {
  const [selectedOwner, setSelectedOwner] = useState(null);

  return (
    <div className="space-y-6">
      <OwnerSelector onSelect={setSelectedOwner} selectedOwner={selectedOwner} />
      
      {selectedOwner ? (
        <OwnerDocumentsSection 
          ownerId={selectedOwner.id} 
          ownerName={selectedOwner.owner_name} 
          onUpdate={onUpdate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Owner Selected</h3>
          <p className="text-sm text-slate-500">Please select an owner from the dropdown above to view and manage their documents.</p>
        </div>
      )}
    </div>
  );
}