import React, { useState } from 'react';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Edit,
  Eye,
  FileDown,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  Users,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { HotelVoucher } from '../types/voucher';
import { formatDateDisplay } from '../utils/voucherHelpers';

interface SavedVouchersViewProps {
  vouchers: HotelVoucher[];
  onSelectVoucher: (voucher: HotelVoucher) => void;
  onDuplicateVoucher: (voucher: HotelVoucher) => void;
  onDeleteVoucher: (id: string) => void;
  onCreateNew: () => void;
  onVerifyVoucher: (voucher: HotelVoucher) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export const SavedVouchersView: React.FC<SavedVouchersViewProps> = ({
  vouchers,
  onSelectVoucher,
  onDuplicateVoucher,
  onDeleteVoucher,
  onCreateNew,
  onVerifyVoucher,
  onExportJson,
  onImportJson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter vouchers based on search and status
  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.guestName.toLowerCase().includes(q) ||
      v.hotelName.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      v.invoiceNo.toLowerCase().includes(q) ||
      v.verificationCode.toLowerCase().includes(q) ||
      v.bookingRows.some((row) => row.hcn && row.hcn.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || v.bookingStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate high-level metrics
  const totalCount = vouchers.length;
  const definiteCount = vouchers.filter((v) => v.bookingStatus.toUpperCase() === 'DEFINITE').length;
  const totalNights = vouchers.reduce(
    (acc, v) => acc + v.bookingRows.reduce((rAcc, r) => rAcc + (r.nights || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Vouchers
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {totalCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confirmed (Definite)
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
              {definiteCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Room Nights
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {totalNights}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Guest, Hotel, Invoice No, HCN..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="DEFINITE">DEFINITE</option>
            <option value="TENTATIVE">TENTATIVE</option>
            <option value="ON REQUEST">ON REQUEST</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Backup & Restore */}
          <button
            type="button"
            onClick={onExportJson}
            title="Export all vouchers as JSON backup"
            className="px-3 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>

          <label
            title="Import vouchers from JSON file"
            className="px-3 py-2 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImportJson(file);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </label>

          {/* Create Button */}
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create New Voucher
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredVouchers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No vouchers found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or create a new voucher.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Hotel &amp; City</th>
                  <th className="py-3 px-3">Stay Dates</th>
                  <th className="py-3 px-3">HCN</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.map((v) => {
                  const firstRow = v.bookingRows[0];
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectVoucher(v)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {v.invoiceNo}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                        {formatDateDisplay(v.voucherDate, '-')}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {v.guestName || 'Unnamed Guest'}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {v.nationality}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{v.hotelName}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{v.city}</div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 tabular-nums whitespace-nowrap">
                        {firstRow ? (
                          <>
                            {formatDateDisplay(firstRow.checkIn, '/')} -{' '}
                            {formatDateDisplay(firstRow.checkOut, '/')}
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {firstRow.nights} Nights · {firstRow.roomType}
                            </div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {firstRow?.hcn || '—'}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            v.bookingStatus.toUpperCase() === 'DEFINITE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.bookingStatus.toUpperCase() === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.bookingStatus}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectVoucher(v)}
                            title="Edit in Voucher Builder"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDuplicateVoucher(v)}
                            title="Duplicate Voucher for new customer"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onVerifyVoucher(v)}
                            title="Open Online Verification Certificate"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === v.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded border border-rose-200">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteVoucher(v.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(v.id)}
                              title="Delete voucher"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
