// components/vehicles/VehicleSelector.jsx
import { useState, useEffect } from 'react';
import useVehicles from '../../../hooks/useVehicle';
import { ChevronDown, Car, Check, RefreshCw } from 'lucide-react';

export default function VehicleSelector({ onSelect, selectedVehicle }) {
  const [isOpen, setIsOpen] = useState(false);
  const { vehicles, loading, refetchVehicles } = useVehicles();
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(selectedVehicle);

  // Only fetch once when component mounts
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) {
      refetchVehicles();
    }
  }, []);

  const handleSelect = (vehicle) => {
    setLocalSelectedVehicle(vehicle);
    onSelect(vehicle);
    setIsOpen(false);
  };

  if (loading && (!vehicles || vehicles.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Select Vehicle</h3>
        <button
          onClick={() => refetchVehicles()}
          className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
          title="Refresh vehicles"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-primary-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <Car size={20} className="text-slate-400" />
            {localSelectedVehicle ? (
              <div className="text-left">
                <p className="font-medium text-slate-900">{localSelectedVehicle.registration_no}</p>
                <p className="text-sm text-slate-500">
                  {localSelectedVehicle.car_make} {localSelectedVehicle.car_model}
                </p>
              </div>
            ) : (
              <span className="text-slate-500">Select a vehicle...</span>
            )}
          </div>
          <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {vehicles?.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <Car className="mx-auto mb-2" size={32} />
                  <p className="text-sm">No vehicles available</p>
                </div>
              ) : (
                vehicles?.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleSelect(vehicle)}
                    className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      localSelectedVehicle?.id === vehicle.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{vehicle.registration_no}</p>
                      <p className="text-sm text-slate-500">
                        {vehicle.car_make} {vehicle.car_model} • {vehicle.car_type}
                      </p>
                    </div>
                    {localSelectedVehicle?.id === vehicle.id && (
                      <Check size={18} className="text-primary-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Selected Vehicle Info */}
      {localSelectedVehicle && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Selected Vehicle Details</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Registration:</span>
              <span className="ml-2 font-medium">{localSelectedVehicle.registration_no}</span>
            </div>
            <div>
              <span className="text-slate-500">Make/Model:</span>
              <span className="ml-2">{localSelectedVehicle.car_make} {localSelectedVehicle.car_model}</span>
            </div>
            <div>
              <span className="text-slate-500">Type:</span>
              <span className="ml-2">{localSelectedVehicle.car_type}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                localSelectedVehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                localSelectedVehicle.status === 'on_rent' ? 'bg-blue-100 text-blue-700' :
                localSelectedVehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {localSelectedVehicle.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}