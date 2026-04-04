// components/vehicles/VehicleImageGallery.jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Image as ImageIcon, Car } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function VehicleImageGallery({ vehicle }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!vehicle) {
    return (
      <EmptyState 
        title="No vehicle selected"
        description="Please select a vehicle from the list to view its images."
      />
    );
  }

  const images = vehicle.images || [];
  
  if (images.length === 0) {
    return (
      <EmptyState 
        title="No images available"
        description="No images have been uploaded for this vehicle yet."
      />
    );
  }

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const downloadImage = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `vehicle-${vehicle.registration_no}-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Info Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Car size={32} className="text-white/80" />
          <div>
            <h2 className="text-2xl font-bold">
              {vehicle.car_make} {vehicle.car_model}
            </h2>
            <p className="text-primary-100 mt-1">
              Registration: {vehicle.registration_no} • {vehicle.car_type} • {vehicle.year_of_model || 'Year not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Image Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="relative bg-slate-900 min-h-[400px] flex items-center justify-center">
          <img
            src={images[currentIndex].url}
            alt={`Vehicle image ${currentIndex + 1}`}
            className="max-h-[500px] w-full object-contain cursor-pointer"
            onClick={() => setSelectedImage(images[currentIndex].url)}
          />
          
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Download Button */}
          <button
            onClick={() => downloadImage(images[currentIndex].url, currentIndex)}
            className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-black/70 transition-all"
          >
            <Download size={16} />
            Download
          </button>
        </div>

        {/* Thumbnail Gallery */}
        <div className="p-4 border-t border-slate-200">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-primary-500/20" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Info */}
      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Image Information</h3>
        <div className="space-y-1 text-sm text-slate-600">
          <p>Total Images: <span className="font-semibold text-slate-900">{images.length}</span></p>
          <p>Current Image: <span className="font-semibold text-slate-900">{currentIndex + 1} of {images.length}</span></p>
          <p className="text-xs text-slate-500 mt-2">
            Click on image to view full size • Use navigation arrows to browse • Click download to save image
          </p>
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl w-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}