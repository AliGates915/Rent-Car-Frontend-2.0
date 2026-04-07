// frontend/src/components/bookings/BookingCalendar.jsx
import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const toYMD = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', dot: '#22c55e', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  pending:   { label: 'Pending',   dot: '#f59e0b', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  ongoing:   { label: 'Ongoing',   dot: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  cancelled: { label: 'Cancelled', dot: '#ef4444', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  completed: { label: 'Completed', dot: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
};
const getStatus = (s) =>
  STATUS_CONFIG[s] ?? { label: s, dot: '#94a3b8', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ status }) {
  const cfg = getStatus(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 400,
      letterSpacing: '0.02em', border: `1px solid ${cfg.border}`,
      background: cfg.bg, color: cfg.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, animate, index }) {
  const cfg = getStatus(booking.status);
  return (
    <div style={{
      padding: '13px 15px',
      borderRadius: 10,
      border: `1px solid #f1f5f9`,
      background: '#fff',
      borderLeft: `3px solid ${cfg.dot}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      animation: animate ? `slideIn 0.22s ease ${index * 0.055}s both` : 'none',
    }}>
      {/* Vehicle row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#1e293b', lineHeight: 1.3 }}>
            {booking.car_make} {booking.car_model}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            {booking.registration_no}
          </div>
        </div>
        <Pill status={booking.status} />
      </div>

      {/* Customer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: `${cfg.dot}15`,
          border: `1px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 500, color: cfg.text, flexShrink: 0,
        }}>
          {(booking.customer_name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 400, color: '#334155' }}>{booking.customer_name}</div>
          {booking.customer_phone && (
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>{booking.customer_phone}</div>
          )}
        </div>
      </div>

      {/* Dates + amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          <span style={{ color: '#64748b' }}>{booking.date_from}</span>
          <span style={{ margin: '0 6px', color: '#e2e8f0' }}>→</span>
          <span style={{ color: '#64748b' }}>{booking.date_to}</span>
        </div>
        {booking.total_amount > 0 && (
          <div style={{ fontSize: 11.5, fontWeight: 500, color: cfg.text }}>
            PKR {booking.total_amount.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookingCalendar() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected]   = useState(today);
  const [animate, setAnimate]     = useState(false);

  const { data: bookings, loading } = useFetch('/bookings');

  useEffect(() => {
    setAnimate(false);
    requestAnimationFrame(() => setAnimate(true));
  }, [selected]);

  const getBookingsForDate = (date) => {
    if (!bookings) return [];
    const s = toYMD(date);
    return bookings.filter(
      (b) => b.date_from <= s && b.date_to >= s && b.status !== 'cancelled'
    );
  };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevM = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextM = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedDateBookings = getBookingsForDate(selected);
  const todayStr = toYMD(today);

  const summary = {};
  selectedDateBookings.forEach((b) => { summary[b.status] = (summary[b.status] || 0) + 1; });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

        .bc-root *, .bc-root *::before, .bc-root *::after { box-sizing: border-box; }
        .bc-root { font-family: 'Inter', sans-serif; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin   { to { transform: rotate(360deg); } }

        /* ── Day cell: full rectangle, number centered ── */
        .bc-day-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 54px;          /* fixed height = rectangle */
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          transition: background 0.13s;
          position: relative;
        }
        .bc-day-cell:hover:not(.bc-empty) { background: #f8fafc; }
        .bc-day-cell.bc-today            { background: #0f172a !important; }
        .bc-day-cell.bc-today .bc-num    { color: #fff !important; font-weight: 500 !important; }
        .bc-day-cell.bc-selected:not(.bc-today) {
          background: #eff6ff;
          box-shadow: inset 0 0 0 1.5px #93c5fd;
        }
        .bc-day-cell.bc-selected:not(.bc-today) .bc-num { color: #1d4ed8 !important; }
        .bc-day-cell.bc-empty { cursor: default; pointer-events: none; }

        /* number: light weight, centered */
        .bc-num {
          font-size: 13px;
          font-weight: 400;
          color: #64748b;
          line-height: 1;
        }
        .bc-day-cell.bc-today .bc-num { color: #fff; }

        .bc-nav-btn {
          width: 30px; height: 30px; border-radius: 7px;
          border: 1px solid #e2e8f0; background: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #64748b; font-size: 14px; transition: all 0.12s;
        }
        .bc-nav-btn:hover { background: #0f172a; color: #fff; border-color: #0f172a; }

        .bc-scroll::-webkit-scrollbar { width: 3px; }
        .bc-scroll::-webkit-scrollbar-track { background: transparent; }
        .bc-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      <div className="bc-root" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 330px',
        gap: 16,
        alignItems: 'start',
      }}>

        {/* ── Left: Calendar ── */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            padding: '18px 20px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                {MONTHS[viewMonth]}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, fontWeight: 300 }}>{viewYear}</div>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Monthly status counts */}
              <div style={{ display: 'flex', gap: 5, marginRight: 8 }}>
                {Object.entries(STATUS_CONFIG).slice(0, 3).map(([k, v]) => {
                  const count = bookings?.filter(b => b.status === k).length ?? 0;
                  return count > 0 ? (
                    <div key={k} style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 6, padding: '3px 8px',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: v.dot }} />
                      <span style={{ fontSize: 10.5, color: '#cbd5e1', fontWeight: 400 }}>{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <button className="bc-nav-btn" onClick={prevM}>‹</button>
              <button className="bc-nav-btn" onClick={nextM}>›</button>
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '14px 14px 16px' }}>
            {/* Weekday labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
              {DAYS.map((d) => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 10, fontWeight: 400,
                  color: '#94a3b8', letterSpacing: '0.08em', padding: '4px 0',
                  textTransform: 'uppercase',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="bc-day-cell bc-empty" />;

                const cellDate = new Date(viewYear, viewMonth, day);
                const cellStr  = toYMD(cellDate);
                const isToday  = cellStr === todayStr;
                const isSel    = toYMD(selected) === cellStr;
                const dayBks   = getBookingsForDate(cellDate);
                const statuses = [...new Set(dayBks.map(b => b.status))].slice(0, 3);

                let cls = 'bc-day-cell';
                if (isToday) cls += ' bc-today';
                else if (isSel) cls += ' bc-selected';

                return (
                  <div key={day} className={cls} onClick={() => setSelected(cellDate)}>
                    {/* Date number — centered in rectangle */}
                    <span className="bc-num">{day}</span>

                    {/* Status dots below number */}
                    {statuses.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, marginTop: 5, justifyContent: 'center' }}>
                        {statuses.map((s) => (
                          <span key={s} style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: isToday ? 'rgba(255,255,255,0.6)' : getStatus(s).dot,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            borderTop: '1px solid #f1f5f9', padding: '9px 16px',
            display: 'flex', gap: 14, flexWrap: 'wrap',
          }}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot }} />
                <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 400 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Panel ── */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 560,
        }}>
          {/* Panel header */}
          <div style={{ padding: '15px 17px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>
              {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ marginTop: 7, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {Object.keys(summary).length === 0 ? (
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>No bookings</span>
              ) : Object.entries(summary).map(([s]) => (
                <Pill key={s} status={s} />
              ))}
            </div>
          </div>

          {/* Booking list */}
          <div
            className="bc-scroll"
            style={{ overflowY: 'auto', flex: 1, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 7 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 26, height: 26, border: '2px solid #f1f5f9',
                  borderTopColor: '#0f172a', borderRadius: '50%',
                  margin: '0 auto 10px', animation: 'spin 0.7s linear infinite',
                }} />
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>Loading…</div>
              </div>
            ) : selectedDateBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '44px 0', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>📅</div>
                <div style={{ fontSize: 13, fontWeight: 400, color: '#64748b', marginBottom: 4 }}>No bookings</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 300 }}>
                  Select a date with dots to view
                </div>
              </div>
            ) : (
              selectedDateBookings.map((b, idx) => (
                <BookingCard key={b.id} booking={b} animate={animate} index={idx} />
              ))
            )}
          </div>

          {/* Footer */}
          {selectedDateBookings.length > 0 && (
            <div style={{
              borderTop: '1px solid #f1f5f9', padding: '10px 17px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>
                {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#1e293b' }}>
                PKR {selectedDateBookings.reduce((s, b) => s + (b.total_amount || 0), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

      </div>
    </>
  );
}