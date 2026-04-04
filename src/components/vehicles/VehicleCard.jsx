// components/vehicles/VehicleCard.jsx
import { useState } from 'react';
import { Pencil, Trash2, Car, MapPin, Fuel, Settings, Wind, Tv, DollarSign, Camera, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/helpers';

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  const images = vehicle.images || [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentImageIndex]?.url : null;

  const nextImage = (e) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleImageError = (imageUrl) => {
    setImageError(prev => ({ ...prev, [imageUrl]: true }));
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Section with Carousel */}
      <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
        {hasImages && currentImage && !imageError[currentImage] ? (
          <>
            <img
              src={currentImage}
              alt={`${vehicle.car_make} ${vehicle.car_model}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => handleImageError(currentImage)}
            />
            
            {/* Image Counter Badge */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'w-4 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // Placeholder when no images or image error
          <div className="h-full w-full flex flex-col items-center justify-center">
            <Car size={48} className="text-white/30" />
            <div className="mt-2 flex items-center gap-1 text-white/50 text-sm">
              <ImageIcon size={14} />
              <span>No images</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge value={vehicle.status} />
        </div>

        {/* Image Count Badge (when no image shown due to error) */}
        {hasImages && imageError[currentImage] && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {images.length} image{images.length > 1 ? 's' : ''} available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Registration */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
            {vehicle.car_make} {vehicle.car_model}
          </h3>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {vehicle.registration_no}
          </p>
        </div>

        {/* Key Details Grid */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <DollarSign size={14} className="text-primary-600" />
              <span>Rate per day</span>
            </div>
            <span className="font-semibold text-slate-900">
              {formatCurrency(vehicle.rate_per_day)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin size={14} className="text-slate-400" />
              <span>Location</span>
            </div>
            <span className="text-slate-700">{vehicle.location || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Fuel size={14} className="text-slate-400" />
              <span>Fuel Type</span>
            </div>
            <span className="text-slate-700">{vehicle.fuel_type || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Settings size={14} className="text-slate-400" />
              <span>Transmission</span>
            </div>
            <span className="text-slate-700">{vehicle.transmission_type || '—'}</span>
          </div>
        </div>

        {/* Features */}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {vehicle.air_conditioner && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <Wind size={12} />
              AC
            </span>
          )}
          {vehicle.android && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
              <Tv size={12} />
              Android
            </span>
          )}
          {vehicle.sunroof && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
              <Car size={12} />
              Sunroof
            </span>
          )}
          {vehicle.front_camera && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              <Camera size={12} />
              Front Cam
            </span>
          )}
          {vehicle.rear_camera && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              <Camera size={12} />
              Rear Cam
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            <Car size={12} />
            {vehicle.car_type}
          </span>
         
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onEdit(vehicle)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}