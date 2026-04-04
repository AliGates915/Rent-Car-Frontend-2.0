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

function buildFilters(config, filterValues) {
  return (config.filters || []).map((filter) => ({
    key: filter.key,
    value: filterValues[filter.key] || '',
    options: [{ label: `All ${filter.label}`, value: '' }, ...filter.options.filter(Boolean).map((option) => ({ label: option, value: option }))],
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

  const queryParams = useMemo(() => ({ page, limit: 10, search: debouncedSearch, ...filterValues }), [page, debouncedSearch, filterValues]);
  const { data, meta, loading, refetch } = useFetch(config.endpoint, queryParams);

  const handleAddNew = () => {
    setEditingRecord(null);
    setActiveTab(config.tabs.find((tab) => tab.key === 'form')?.key || defaultTab);
  };

  const handleEdit = (record) => {
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

  const filters = buildFilters(config, filterValues);

  const tableTitle = activeTab === 'history' ? `${config.title} History` : `${config.title} List`;
 

  const renderTabContent = () => {
    switch (activeTab) {
      case 'form':
        return <GenericForm config={config} editingRecord={editingRecord} onSuccess={handleSuccess} onCancelEdit={() => setEditingRecord(null)} />;
      case 'list':
      case 'history':
        return (
          <DataTable
            title={tableTitle}
            description="Search, filter, paginate, and manage records inline."
            columns={config.columns}
            data={data}
            loading={loading}
            search={search}
            onSearch={setSearch}
            filters={filters}
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
            extraActions={
              config.fields.length ? (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Plus size={16} /> Add New
                </button>
              ) : null
            }
          />
        );
      case 'report':
      case 'summary':
      case 'profit-loss':
      case 'daybook':
      case 'due':
        return <ReportSection title={config.title} />;
        case 'documents':
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
