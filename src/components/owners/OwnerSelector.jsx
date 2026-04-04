// components/owners/OwnerSelector.jsx
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Search, User, ChevronDown, Check } from 'lucide-react';

export default function OwnerSelector({ onSelect, selectedOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: owners, loading } = useFetch('/owners', { search, limit: 50 });

  const handleSelect = (owner) => {
    onSelect(owner);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Owner</h3>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-primary-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <User size={20} className="text-slate-400" />
            {selectedOwner ? (
              <div className="text-left">
                <p className="font-medium text-slate-900">{selectedOwner.owner_name}</p>
                <p className="text-sm text-slate-500">{selectedOwner.phone_no}</p>
              </div>
            ) : (
              <span className="text-slate-500">Select an owner...</span>
            )}
          </div>
          <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-64">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : owners?.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <User className="mx-auto mb-2" size={32} />
                    <p className="text-sm">No owners found</p>
                  </div>
                ) : (
                  owners?.map(owner => (
                    <button
                      key={owner.id}
                      onClick={() => handleSelect(owner)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                        selectedOwner?.id === owner.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{owner.owner_name}</p>
                        <p className="text-sm text-slate-500">{owner.phone_no} • {owner.city || 'No city'}</p>
                      </div>
                      {selectedOwner?.id === owner.id && <Check size={18} className="text-primary-600" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedOwner && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Selected Owner Details</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">Name:</span><span className="ml-2 font-medium">{selectedOwner.owner_name}</span></div>
            <div><span className="text-slate-500">Phone:</span><span className="ml-2">{selectedOwner.phone_no}</span></div>
            <div><span className="text-slate-500">CNIC:</span><span className="ml-2">{selectedOwner.cnic_no || 'Not provided'}</span></div>
            <div><span className="text-slate-500">Status:</span><span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${selectedOwner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedOwner.status}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}