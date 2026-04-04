import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import ReferenceForm from "./ReferenceForm";
import ReferenceList from "./ReferenceList";

export default function CustomerReferencesSection() {
  const [customerId, setCustomerId] = useState("");
  const [editingRef, setEditingRef] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: customers } = useFetch("/customers");

  const selectedCustomer = customers?.find(c => c.id == customerId);

  return (
    <div className="space-y-4">

      {/* SELECT */}
      <select
        value={customerId}
        onChange={(e) => {
          setCustomerId(e.target.value);
          setEditingRef(null);
        }}
        className="border p-2 rounded"
      >
        <option value="">Select Customer</option>
        {customers?.map(c => (
          <option key={c.id} value={c.id}>
            {c.customer_name}
          </option>
        ))}
      </select>

      {/* TITLE */}
      {selectedCustomer && (
        <div className="p-3 bg-slate-100 rounded-xl">
          References for: {selectedCustomer.customer_name}
        </div>
      )}

      {/* FORM */}
      {customerId && (
       <ReferenceForm
  customerId={customerId}
  editingRef={editingRef}
  onSuccess={() => {
    setEditingRef(null);
    setRefreshKey(prev => prev + 1); // 🔥 trigger reload
  }}
/>
      )}

      {/* LIST */}
      {customerId && (
       <ReferenceList
       key={refreshKey} // 🔥 force re-render
       customerId={customerId}
       onRefetch={setRefreshKey}
       onEdit={(row) => setEditingRef(row)}
     />
      )}

    </div>
  );
}