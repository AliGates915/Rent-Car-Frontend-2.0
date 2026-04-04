// components/vehicles/VehicleSelectorRadio.jsx
import { useState } from 'react';
import useFetch from '../../../hooks/useFetch';
import { Car } from 'lucide-react';

export default function VehicleSelectorRadio({ onSelect, selectedVehicle }) {
  const { data: vehicles, loading } = useFetch('/vehicles', { limit: 100 });
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(selectedVehicle);

  const handleSelect = (vehicle) => {
    setLocalSelectedVehicle(vehicle);
    onSelect(vehicle);
  };

  if (loading) {
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
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Vehicle</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {vehicles?.map(vehicle => (
          <label
            key={vehicle.id}
            className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
              localSelectedVehicle?.id === vehicle.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="vehicle"
              value={vehicle.id}
              checked={localSelectedVehicle?.id === vehicle.id}
              onChange={() => handleSelect(vehicle)}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{vehicle.registration_no}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                  vehicle.status === 'on_rent' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {vehicle.car_make} {vehicle.car_model} • {vehicle.car_type}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-slate-400">
                <span>📍 {vehicle.location || 'Location not set'}</span>
                <span>💰 {vehicle.rate_per_day}/day</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {vehicles?.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Car className="mx-auto mb-2" size={32} />
          <p>No vehicles available</p>
        </div>
      )}
    </div>
  );
}