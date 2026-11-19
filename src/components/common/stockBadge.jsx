import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function StockBadge({ availableStock, totalStock, showTotal = true }) {
  const isAvailable = Number(availableStock) > 0;

  if (!isAvailable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] sm:px-2.5 sm:text-xs font-semibold text-rose-700">
        <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        Stok Habis
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#89CFF3] bg-white/95 sm:bg-[#CDF5FD]/90 px-2 py-0.5 text-[10px] sm:px-2.5 sm:text-xs font-semibold text-[#0088CC] shadow-2xs">
      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#00A9FF] shrink-0" />
      <span>
        Tersedia: {availableStock}
        {showTotal && totalStock !== undefined ? ` / ${totalStock}` : ''}
      </span>
    </span>
  );
}
