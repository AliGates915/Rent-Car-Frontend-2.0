import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Car, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import maintenanceService from '../services/maintenance.service';
import vehicleService from '../services/vehicle.service';

export default function DueMaintenance() {
  const [dueMaintenance, setDueMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(7);
  const [vehicles, setVehicles] = useState({});

  const fetchDueMaintenance = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getDueMaintenance(daysAhead);
      setDueMaintenance(data);
    } catch (error) {
      console.error('Error fetching due maintenance:', error);
      toast.error('Failed to load due maintenance');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      const vehicleMap = {};
      data.forEach(v => {
        vehicleMap[v.id] = `${v.registration_no} - ${v.car_make} ${v.car_model}`;
      });
      setVehicles(vehicleMap);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchDueMaintenance();
  }, [daysAhead]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysDueColor = (days) => {
    if (days < 0) return 'text-red-600';
    if (days <= 2) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (isOverdue) => {
    if (isOverdue) return <AlertCircle size={18} className="text-red-600" />;
    return <Clock size={18} className="text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Due Maintenance</h2>
          <p className="text-sm text-gray-500">Upcoming and overdue vehicle maintenance schedules</p>
        </div>
        
        <select
          value={daysAhead}
          onChange={(e) => setDaysAhead(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="3">Next 3 days</option>
          <option value="7">Next 7 days</option>
          <option value="14">Next 14 days</option>
          <option value="30">Next 30 days</option>
        </select>
      </div>

      {dueMaintenance.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-green-800 mb-1">No Due Maintenance</h3>
          <p className="text-sm text-green-600">All vehicles are up to date on maintenance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dueMaintenance.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car size={20} className="text-primary-600" />
                    <h3 className="font-semibold text-gray-800">
                      {vehicles[item.vehicle_id] || `Vehicle #${item.vehicle_id}`}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {item.maintenance_type || 'Scheduled'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Due Date:</span> {formatDate(item.due_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.is_overdue)}
                      <span className={`text-sm font-medium ${getDaysDueColor(item.days_due)}`}>
                        {item.is_overdue 
                          ? `Overdue by ${Math.abs(item.days_due)} days`
                          : `Due in ${item.days_due} days`}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Notes:</span> {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // You can implement functionality to schedule maintenance
                      toast.success('Maintenance scheduling feature coming soon');
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Wrench size={16} />
                    Schedule Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}