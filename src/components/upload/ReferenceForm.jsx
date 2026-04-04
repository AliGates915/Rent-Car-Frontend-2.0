import { useEffect, useState } from "react";
import { moduleApi } from '../../services/api';
import toast from "react-hot-toast";

export default function ReferenceForm({ customerId, editingRef, onSuccess }) {
  const [form, setForm] = useState({
    reference_name: "",
    reference_father: "",
    reference_phone_no: "",
    reference_cnic: "",
    reference_address: "",
    relation_with_customer: "",
  });

  // ✅ EDIT MODE FILL
  useEffect(() => {
    if (editingRef) {
      setForm(editingRef);
    }
  }, [editingRef]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.reference_name) return alert("Required");
    // console.log(form);
    

    try {
      if (editingRef) {
        // 🔥 UPDATE
        await moduleApi.update(
          `/customers/${customerId}/references`,
          editingRef.id,
          form
        );
        toast.success("Updated");
      } else {
        // 🔥 CREATE
        await moduleApi.create(`/customers/${customerId}/references`, form);
        toast.success("Added");
      }

      // reset
      setForm({
        reference_name: "",
        reference_father: "",
        reference_phone_no: "",
        reference_cnic: "",
        reference_address: "",
        relation_with_customer: "",
      });

      onSuccess?.(); // 🔥 reload list

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3">

      <h3 className="font-semibold">
        {editingRef ? "Edit Reference" : "Add Reference"}
      </h3>

      <input name="reference_name" placeholder="Name" value={form.reference_name} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="reference_father" placeholder="Father Name" value={form.reference_father} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="reference_phone_no" placeholder="Phone" value={form.reference_phone_no} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="reference_cnic" placeholder="CNIC" value={form.reference_cnic} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="relation_with_customer" placeholder="Relation" value={form.relation_with_customer} onChange={handleChange} className="w-full border p-2 rounded" />

      <textarea name="reference_address" placeholder="Address" value={form.reference_address} onChange={handleChange} className="w-full border p-2 rounded" />

      <button onClick={handleSubmit} className="bg-primary-600 text-white px-4 py-2 rounded">
        {editingRef ? "Update" : "Save"}
      </button>
    </div>
  );
}