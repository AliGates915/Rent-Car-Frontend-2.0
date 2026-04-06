// frontend/src/components/setup/SetupManager.jsx
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import DataTable from '../ui/DataTable';
import GenericForm from '../GenericForm';
import { setupTypeConfigs } from '../../data/moduleConfigs';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { moduleApi } from '../../services/api';

const SetupManager = ({ setupType, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'form'
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const debouncedSearch = useDebounce(search, 500);

  const config = setupTypeConfigs[setupType];
  
  if (!config) {
    return <div className="text-red-600">Invalid setup type: {setupType}</div>;
  }

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      search: debouncedSearch || undefined
    };
    
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] && filterValues[key] !== '') {
        params[key] = filterValues[key];
      }
    });
    
    return params;
  }, [page, debouncedSearch, filterValues]);

  const { data, meta, loading, refetch } = useFetch(config.endpoint, queryParams);

  const handleAddNew = () => {
    setEditingRecord(null);
    setActiveTab('form');
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setActiveTab('form');
  };

  const handleDelete = async (record) => {
    if (!record?.id) return;
    try {
      await moduleApi.remove(config.endpoint, record.id);
      toast.success('Record deleted successfully');
      refetch();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleFormSuccess = () => {
    setEditingRecord(null);
    refetch();
    setActiveTab('list');
    if (onSuccess) onSuccess();
    toast.success(`${editingRecord ? 'Updated' : 'Created'} successfully`);
  };

  const handleCancelForm = () => {
    setEditingRecord(null);
    setActiveTab('list');
  };

  if (activeTab === 'form') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <GenericForm
          config={config}
          editingRecord={editingRecord}
          onSuccess={handleFormSuccess}
          onCancelEdit={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add New {config.title.slice(0, -1)}
        </button>
      </div>
      
      <DataTable
        title={`${config.title} List`}
        description="Search, filter, paginate, and manage records inline."
        columns={config.columns}
        data={data}
        loading={loading}
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={[]}
        onFilterChange={() => {}}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={page}
        total={meta?.total || 0}
        limit={meta?.limit || 10}
        onPageChange={setPage}
        actions={true}
      />
    </div>
  );
};

export default SetupManager;