import useFetch from '../../hooks/useFetch';
import { useEffect } from 'react';
import DataTable from '../ui/DataTable';
import { Pencil, Trash2 } from 'lucide-react';
import { moduleApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReferenceList({ customerId, onEdit, onRefetch }) {
  const { data, loading, refetch } = useFetch(`/customers/${customerId}/references`);
  useEffect(() => {
    onRefetch(refetch); // 🔥 send refetch to parent
  }, []);
  const handleDelete = async (row) => {
    if (!window.confirm("Delete this reference?")) return;

    try {
      await moduleApi.remove(`/customers/${customerId}/references`, row.id);
      toast.success("Deleted");
      refetch(); // 🔥 reload
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DataTable
      title="Customer References"
      columns={[
        { key: "reference_name", label: "Name" },
        { key: "reference_phone_no", label: "Phone" },
        { key: "reference_cnic", label: "CNIC" },
        { key: "relation_with_customer", label: "Relation" },
        { key: "reference_address", label: "Address" },

        {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(row)}
                className="bg-primary-600 text-white px-2 py-2 rounded"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => handleDelete(row)}
                className="bg-red-600 text-white px-2 py-2 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        }
      ]}
      data={data}
      loading={loading}
      actions={false}
    />
  );
}