import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';

export default function LoanStatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bgClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
