// components/owners/OwnerSelector.jsx
import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { Search, User, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { moduleApi } from '../../services/api';

export default function OwnerSelector({ onSelect, selectedOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch owners directly instead of using useFetch to have better control
  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await moduleApi.getAll('/owners', { 
          params: { 
            search: search || undefined,
            limit: 100,
            status: 'active'
          } 
        });
        
        console.log('Owners API Response:', response);
        
        // Handle different response structures
        let ownersData = [];
        if (response.data && Array.isArray(response.data)) {
          ownersData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          ownersData = response.data.data;
        } else if (Array.isArray(response)) {
          ownersData = response;
        } else if (response.data && response.data.owners && Array.isArray(response.data.owners)) {
          ownersData = response.data.owners;
        } else {
          ownersData = [];
        }
        
        setOwners(ownersData);
      } catch (err) {
        console.error('Error fetching owners:', err);
        setError(err.response?.data?.message || 'Failed to load owners');
        setOwners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [search]);

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
                <p className="text-sm text-slate-500">{selectedOwner.phone_no || selectedOwner.phone}</p>
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
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-96 overflow-hidden">
              <div className="p-3 border-b bg-white sticky top-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-64">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
                    <p className="text-sm text-red-600">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm text-primary-600 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : owners.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <User className="mx-auto mb-2" size={32} />
                    <p className="text-sm">No owners found</p>
                    {search && <p className="text-xs mt-1">Try a different search term</p>}
                  </div>
                ) : (
                  owners.map(owner => (
                    <button
                      key={owner.id}
                      onClick={() => handleSelect(owner)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0 ${
                        selectedOwner?.id === owner.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{owner.owner_name}</p>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          <span>{owner.phone_no || owner.phone || 'No phone'}</span>
                          {owner.cnic_no && <span>• CNIC: {owner.cnic_no}</span>}
                          {owner.city && <span>• {owner.city}</span>}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            owner.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : owner.status === 'inactive' 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {owner.status || 'active'}
                          </span>
                          {owner.total_vehicles > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {owner.total_vehicles} vehicles
                            </span>
                          )}
                        </div>
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
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-800 mb-2">Selected Owner Details</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>
              <span className="ml-2 font-medium text-slate-700">{selectedOwner.owner_name}</span>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>
              <span className="ml-2 text-slate-700">{selectedOwner.phone_no || selectedOwner.phone}</span>
            </div>
            {selectedOwner.cnic_no && (
              <div>
                <span className="text-slate-500">CNIC:</span>
                <span className="ml-2 text-slate-700">{selectedOwner.cnic_no}</span>
              </div>
            )}
            {selectedOwner.city && (
              <div>
                <span className="text-slate-500">City:</span>
                <span className="ml-2 text-slate-700">{selectedOwner.city}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedOwner.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedOwner.status || 'active'}
              </span>
            </div>
            {selectedOwner.total_vehicles !== undefined && (
              <div>
                <span className="text-slate-500">Vehicles:</span>
                <span className="ml-2 text-slate-700">{selectedOwner.total_vehicles}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}