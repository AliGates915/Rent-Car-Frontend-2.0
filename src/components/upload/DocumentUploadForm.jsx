import { useState } from 'react';
import { moduleApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function DocumentUploadForm({ customerId }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [type, setType] = useState("");
  
    const handleFile = (e) => {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    };
  
    const handleUpload = async () => {
      if (!file || !type) return alert("Required");
  
      const formData = new FormData();
      formData.append("document_type", type);
      formData.append("images", file);
  
      await moduleApi.post(`/customers/${customerId}/document`, formData);
  
      toast.success("Uploaded");
    };
  
    return (
      <div className="p-4 border rounded-xl">
  
        <select onChange={(e) => setType(e.target.value)}>
          <option value="">Select Type</option>
          <option value="cnic_front">CNIC Front</option>
          <option value="cnic_back">CNIC Back</option>
          <option value="driving_license">License</option>
        </select>
  
        <input type="file" onChange={handleFile} />
  
        {/* 🔥 PREVIEW */}
        {preview && (
          <div className="mt-3">
            <img src={preview} className="h-32 rounded" />
            <button onClick={handleUpload}>
              Confirm Upload
            </button>
          </div>
        )}
      </div>
    );
  }