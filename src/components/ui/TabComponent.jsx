import { classNames } from '../../utils/helpers';

export default function TabComponent({ tabs, activeTab, onChange }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-soft">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={classNames(
                'relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              {tab.label}
              <span
                className={classNames(
                  'absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-all duration-300',
                  isActive ? 'bg-primary-600 opacity-100' : 'bg-transparent opacity-0'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
