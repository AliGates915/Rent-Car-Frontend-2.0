// frontend/src/pages/ModulePage.jsx
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
import VehicleImageGallery from '../components/vehicles/VehicleImageGallery';
import VehicleForm from '../components/vehicles/VehicleForm';
import VehicleDocumentsManager from '../components/vehicles/documents/VehicleDocumentsManager';
import OwnerDocumentsManager from '../components/owners/OwnerDocumentsManager';
import OwnerEarningsManager from '../components/owners/onwer-earning/OwnerEarningsManager';
import SetupManager from '../components/setup/SetupManager';
import BookingForm from '../components/bookings/BookingForm';
import BookingListView from '../components/bookings/BookingListView';
import BookingCalendar from '../components/bookings/BookingCalendar';
import BookingHistory from '../components/bookings/BookingHistory';
import HandoverForm from '../components/handover/HandoverForm';
import HandoverListView from '../components/handover/HandoverListView';
import ReturnForm from '../components/return/ReturnForm';
import ReturnListView from '../components/return/ReturnListView';

import CashReceiptsForm from '../components/cash-receipts/CashReceiptsForm';
import CashReceiptsListView from '../components/cash-receipts/CashReceiptsListView';
import CashReceiptsReport from '../components/cash-receipts/CashReceiptsReport';

function buildFilters(config, filterValues) {
  if (!config?.filters || !Array.isArray(config.filters)) {
    return [];
  }

  return config.filters
    .filter(filter => filter && filter.key)
    .map((filter) => {
      let options = [];
      
      if (filter.options && Array.isArray(filter.options)) {
        options = filter.options.map(opt => {
          if (typeof opt === 'object' && opt !== null) {
            return {
              label: opt.label || opt.value || `All ${filter.label}`,
              value: opt.value || opt.label || ''
            };
          }
          return {
            label: opt === '' || opt === null ? `All ${filter.label}` : String(opt),
            value: opt === null || opt === undefined ? '' : opt
          };
        });
      } else {
        options = [{ 
          label: `All ${filter.label || filter.key}`, 
          value: '' 
        }];
      }
      
      return {
        key: filter.key,
        value: filterValues[filter.key] || '',
        label: filter.label || filter.key,
        options: options
      };
    });
}

function PlaceholderContent({ title }) {
  return <EmptyState title={`${title} section`} description="Connect this tab with your dedicated API endpoint to populate records, files, or related references." />;
}

export default function ModulePage({ moduleKey }) {
  const config = moduleConfigs[moduleKey];

  // For setup module, use special handling
  if (moduleKey === 'setup') {
    const [selectedSetupType, setSelectedSetupType] = useState(config.setupTypes[0]?.key);

    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3">
          <TabComponent
            tabs={config.tabs}
            activeTab={selectedSetupType}
            onChange={setSelectedSetupType}
          />
        </div>
        <div className="animate-in fade-in-50 duration-300">
          {selectedSetupType && (
            <SetupManager
              setupType={selectedSetupType}
              key={selectedSetupType}
            />
          )}
        </div>
      </div>
    );
  }

  // For non-setup modules, use regular handling
  return <RegularModulePage moduleKey={moduleKey} config={config} />;
}

// Regular module page component
function RegularModulePage({ moduleKey, config }) {
  const defaultTab = config.tabs[0]?.key || 'list';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const debouncedSearch = useDebounce(search, 500);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
    setActiveTab(config.tabs.find((tab) => tab.key === 'form')?.key || defaultTab);
  };

  const handleEdit = (record) => {
    if (moduleKey === 'owners') {
      setSelectedOwner(record);
    }
    if (moduleKey === 'vehicles') {
      setSelectedVehicle(record);
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
        if (moduleKey === 'bookings') {
          return (
            <BookingForm
              config={config}
              editingRecord={editingRecord}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingRecord(null)}
            />
          );
        }
        if (moduleKey === 'return') {
          return (
            <ReturnForm
              config={config}
              editingRecord={editingRecord}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingRecord(null)}
            />
          );
        }
        if (moduleKey === 'handover') {
          return (
            <HandoverForm
              config={config}
              editingRecord={editingRecord}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingRecord(null)}
            />
          );
        }
        if (moduleKey === 'cash-receipts') {
          return (
            <CashReceiptsForm
              config={config}
              editingRecord={editingRecord}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingRecord(null)}
            />
          );
        }

        return <GenericForm config={config} editingRecord={editingRecord} onSuccess={handleSuccess} onCancelEdit={() => setEditingRecord(null)} />;

      case 'list':
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
        
        if (moduleKey === 'cash-receipts') {
          return (
            <CashReceiptsListView
              receipts={data}
              loading={loading}
              search={search}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              filters={buildFilters(config, filterValues)}
              filterValues={filterValues}
              onFilterChange={(key, value) => {
                setPage(1);
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewReceipt={(receipt) => {
                // Handle viewing receipt details - could open a modal
                console.log('View receipt:', receipt);
              }}
              page={page}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          );
        }
        
        if (moduleKey === 'bookings') {
          return (
            <BookingListView
              bookings={data}
              loading={loading}
              search={search}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              filters={buildFilters(config, filterValues)}
              filterValues={filterValues}
              onFilterChange={(key, value) => {
                setPage(1);
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              page={page}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          );
        }
        
        if (moduleKey === 'handover') {
          return (
            <HandoverListView
              handovers={data}
              loading={loading}
              search={search}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              filters={buildFilters(config, filterValues)}
              filterValues={filterValues}
              onFilterChange={(key, value) => {
                setPage(1);
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              page={page}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          );
        }
        
        if (moduleKey === 'return') {
          return (
            <ReturnListView
            returns={data}
            loading={loading}
            search={search}
            onSearch={setSearch}
            filters={buildFilters(config, filterValues)}
            filterValues={filterValues}
            onFilterChange={(key, value) => {
              setPage(1);
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            page={page}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
            // summary={summary} 
          />
          );
        }
        
        if (moduleKey === 'owner-earnings') {
          return <OwnerEarningsManager />;
        }
        
        // Default DataTable for other modules
        return (
          <DataTable
            title={`${config.title} List`}
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

      case 'history':
        if (moduleKey === 'bookings') {
          return <BookingHistory />;
        }
        
        return (
          <DataTable
            title={`${config.title} History`}
            description="Historical records view"
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
            page={page}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
            actions={false}
          />
        );

      case 'calendar':
        if (moduleKey === 'bookings') {
          return <BookingCalendar />;
        }
        return <PlaceholderContent title={activeTab} />;

      case 'images':
        if (moduleKey === 'vehicles') {
          return <VehicleImageGallery vehicle={selectedVehicle || data?.[0]} />;
        }
        return <PlaceholderContent title={activeTab} />;

      case 'report':
        if (moduleKey === 'cash-receipts') {
          return <CashReceiptsReport />;
        }
        return <ReportSection title={config.title} />;

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

      default:
        return <TimelineSection title={`${config.title} Timeline`} />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabComponent tabs={config.tabs} activeTab={activeTab} onChange={setActiveTab} />
        {config.fields?.length > 0 && activeTab !== 'form' && moduleKey !== 'owner-earnings' && moduleKey !== 'bookings-history' ? (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} /> Add New
          </button>
        ) : null}
      </div>
      <div className="animate-in fade-in-50 duration-300">{renderTabContent()}</div>
    </div>
  );
}