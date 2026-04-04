import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import TabComponent from '../components/ui/TabComponent';
import GenericForm from '../components/GenericForm';
import DataTable from '../components/ui/DataTable';
import ReportSection from '../components/ReportSection';
import TimelineSection from '../components/TimelineSection';
import EmptyState from '../components/ui/EmptyState';
import { moduleConfigs } from '../data/moduleConfigs';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { moduleApi } from '../services/api';
import CustomerDocumentsSection from '../components/upload/CustomerDocumentsSection';
import CustomerReferencesSection from '../components/upload/CustomerReferencesSection';
import VehicleListView from '../components/vehicles/VehicleListView';
// In ModulePage.jsx, add import
import VehicleImageGallery from '../components/vehicles/VehicleImageGallery';
import VehicleForm from '../components/vehicles/VehicleForm';
import VehicleDocumentsManager from '../components/vehicles/documents/VehicleDocumentsManager';
import OwnerDocumentsManager from '../components/owners/OwnerDocumentsManager';



// Add this function to build filter options
function buildFilters(config, filterValues) {
  return (config.filters || []).map((filter) => ({
    key: filter.key,
    value: filterValues[filter.key] || '',
    options: filter.options || [{ label: `All ${filter.label}`, value: '' }],
  }));
}


function PlaceholderContent({ title }) {
  return <EmptyState title={`${title} section`} description="Connect this tab with your dedicated API endpoint to populate records, files, or related references." />;
}

export default function ModulePage({ moduleKey }) {
  const config = moduleConfigs[moduleKey];
  const defaultTab = config.tabs[0]?.key || 'list';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const debouncedSearch = useDebounce(search, 500);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // In ModulePage.jsx, update the queryParams useMemo
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      search: debouncedSearch || undefined  // Only include if has value
    };

    // Add filters to query params
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
    setActiveTab(config.tabs.find((tab) => tab.key === 'form')?.key || defaultTab);
  };

  const handleEdit = (record) => {
    if (moduleKey === 'owners') {
      setSelectedOwner(record);
    }
    setEditingRecord(record);
    setActiveTab(config.tabs.find((tab) => tab.key === 'form')?.key || defaultTab);
  };




  const handleDelete = async (record) => {
    if (!record?.id) return;
    try {
      await moduleApi.remove(config.endpoint, record.id);
      toast.success('Record deleted successfully');
      refetch();
    } catch {
      // interceptor handles
    }
  };

  const handleSuccess = () => {
    setEditingRecord(null);
    refetch();
    setActiveTab(config.tabs.find((tab) => tab.key === 'list')?.key || defaultTab);
  };


  const tableTitle = activeTab === 'history' ? `${config.title} History` : `${config.title} List`;


  const renderTabContent = () => {
    switch (activeTab) {
      case 'form':
        if (moduleKey === 'vehicles') {
          return (
            <VehicleForm
              config={config}
              editingRecord={editingRecord}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingRecord(null)}
            />
          );
        }

        return <GenericForm config={config} editingRecord={editingRecord} onSuccess={handleSuccess} onCancelEdit={() => setEditingRecord(null)} />;
      case 'list':
      case 'history':
        // Special handling for vehicles to use card/grid view
        if (moduleKey === 'vehicles') {
          const filters = buildFilters(config, filterValues);
          return (
            <VehicleListView
              vehicles={data}
              loading={loading}
              search={search}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              filters={filters}
              filterValues={filterValues}
              onFilterChange={(key, value) => {
                setPage(1);
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onEdit={config.fields.length ? handleEdit : undefined}
              onDelete={config.columns.length ? handleDelete : undefined}
              page={page}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          );
        }

        // Default table view for other modules
        return (
          <DataTable
            title={tableTitle}
            description="Search, filter, paginate, and manage records inline."
            columns={config.columns}
            data={data}
            loading={loading}
            search={search}
            onSearch={setSearch}
            filters={buildFilters(config, filterValues)}
            onFilterChange={(key, value) => {
              setPage(1);
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onEdit={config.fields.length ? handleEdit : undefined}
            onDelete={config.columns.length ? handleDelete : undefined}
            page={page}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
            actions={Boolean(config.fields.length || config.columns.length)}

          />
        );
      // In renderTabContent function, add the images case:
      case 'images':
        // For vehicles, show image gallery with selected vehicle
        if (moduleKey === 'vehicles') {
          // You'll need to pass the selected vehicle from state
          // Add this state at the top of ModulePage component
          // const [selectedVehicle, setSelectedVehicle] = useState(null);
          return <VehicleImageGallery vehicle={selectedVehicle || data?.[0]} />;
        }
        return <PlaceholderContent title={activeTab} />;
      case 'report':
      case 'summary':
      case 'profit-loss':
      case 'daybook':
      case 'due':
        return <ReportSection title={config.title} />;
      case 'documents':
        if (moduleKey === 'vehicles') {
          return <VehicleDocumentsManager />;
        }
        if (moduleKey === 'owners') {
          return <OwnerDocumentsManager onUpdate={refetch} />;
        }
        return <CustomerDocumentsSection />;
      case 'references':
        return <CustomerReferencesSection />;
      case 'images':
        return <PlaceholderContent title={activeTab} />;
      default:
        return <TimelineSection title={`${config.title} Timeline`} />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabComponent tabs={config.tabs} activeTab={activeTab} onChange={setActiveTab} />
        {config.fields.length && activeTab !== 'form' ? (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Plus size={16} /> Add New
          </button>
        ) : null}
      </div>
      <div className="animate-in fade-in-50 duration-300">{renderTabContent()}</div>
    </div>
  );
}
