import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  QrCode,
  FileText,
  Phone,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HotelVoucher, BookingRow, QRContentType } from '../types/voucher';
import {
  calculateNights,
  DEFAULT_TERMS,
  MEAL_PLAN_OPTIONS,
  ROOM_TYPE_PRESETS,
  CITY_PRESETS,
  STATUS_OPTIONS,
} from '../utils/voucherHelpers';
import { getNextInvoiceNumber } from '../utils/storage';

interface VoucherEditorProps {
  voucher: HotelVoucher;
  onChange: (updated: HotelVoucher) => void;
  onResetToDefault: () => void;
}

export const VoucherEditor: React.FC<VoucherEditorProps> = ({
  voucher,
  onChange,
  onResetToDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'rooms' | 'terms' | 'company' | 'qr'>('details');

  const updateField = <K extends keyof HotelVoucher>(field: K, value: HotelVoucher[K]) => {
    onChange({
      ...voucher,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle Booking Rows
  const handleRowChange = (index: number, field: keyof BookingRow, value: any) => {
    const updatedRows = [...voucher.bookingRows];
    const currentRow = { ...updatedRows[index], [field]: value };

    // Auto-calculate nights when checkIn or checkOut changes
    if (field === 'checkIn' || field === 'checkOut') {
      const checkInVal = field === 'checkIn' ? value : currentRow.checkIn;
      const checkOutVal = field === 'checkOut' ? value : currentRow.checkOut;
      currentRow.nights = calculateNights(checkInVal, checkOutVal);
    }

    updatedRows[index] = currentRow;
    updateField('bookingRows', updatedRows);
  };

  const addBookingRow = () => {
    const lastRow = voucher.bookingRows[voucher.bookingRows.length - 1];
    let nextCheckIn = '2026-10-20';
    let nextCheckOut = '2026-10-25';

    if (lastRow) {
      nextCheckIn = lastRow.checkOut;
      const d = new Date(lastRow.checkOut);
      d.setDate(d.getDate() + 5);
      nextCheckOut = d.toISOString().split('T')[0];
    }

    const newRow: BookingRow = {
      id: 'row_' + Date.now(),
      sNo: voucher.bookingRows.length + 1,
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      roomType: 'Standard Twin',
      nights: calculateNights(nextCheckIn, nextCheckOut),
      noOfRooms: 1,
      meal: 'RO',
      hcn: '',
    };

    updateField('bookingRows', [...voucher.bookingRows, newRow]);
  };

  const removeBookingRow = (index: number) => {
    if (voucher.bookingRows.length <= 1) return;
    const filtered = voucher.bookingRows.filter((_, i) => i !== index);
    // re-index sNo
    const reindexed = filtered.map((row, idx) => ({ ...row, sNo: idx + 1 }));
    updateField('bookingRows', reindexed);
  };

  // Handle Terms
  const handleTermChange = (index: number, text: string) => {
    const updated = [...voucher.termsAndConditions];
    updated[index] = text;
    updateField('termsAndConditions', updated);
  };

  const addTerm = () => {
    updateField('termsAndConditions', [
      ...voucher.termsAndConditions,
      'Hotel check-in policy applies as per local hotel standard operating procedures.',
    ]);
  };

  const removeTerm = (index: number) => {
    updateField(
      'termsAndConditions',
      voucher.termsAndConditions.filter((_, i) => i !== index)
    );
  };

  const resetTerms = () => {
    updateField('termsAndConditions', [...DEFAULT_TERMS]);
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateField('companyInfo', {
          ...voucher.companyInfo,
          logoUrl: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateField('companyInfo', {
      ...voucher.companyInfo,
      logoUrl: undefined,
    });
  };

  const setAutoNextInvoice = () => {
    const next = getNextInvoiceNumber();
    updateField('invoiceNo', next);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'details'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-700" />
          Guest &amp; Hotel
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'rooms'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-700" />
          Booking Details ({voucher.bookingRows.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'terms'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-700" />
          Terms &amp; Policies
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'company'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-slate-700" />
          Emergency &amp; Agency
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'qr'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-slate-700" />
          QR Verification
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {/* ================= TAB 1: GUEST & HOTEL DETAILS ================= */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Invoice Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucher.invoiceNo}
                    onChange={(e) => updateField('invoiceNo', e.target.value)}
                    placeholder="0001001"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={setAutoNextInvoice}
                    title="Auto-calculate next sequential invoice number"
                    className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap border border-slate-300 transition-colors"
                  >
                    Next ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Voucher Date
                </label>
                <input
                  type="date"
                  value={voucher.voucherDate}
                  onChange={(e) => updateField('voucherDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Guest Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={voucher.guestName}
                    onChange={(e) => updateField('guestName', e.target.value)}
                    placeholder="e.g. Abdul basit"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={voucher.nationality}
                  onChange={(e) => updateField('nationality', e.target.value.toUpperCase())}
                  placeholder="PAKISTANI"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={voucher.hotelName}
                  onChange={(e) => updateField('hotelName', e.target.value)}
                  placeholder="e.g. Astoneast Taiba"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucher.city}
                    onChange={(e) => updateField('city', e.target.value.toUpperCase())}
                    placeholder="MADINAH"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-medium"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) updateField('city', e.target.value);
                    }}
                    value=""
                    className="px-2 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                  >
                    <option value="" disabled>
                      Presets
                    </option>
                    {CITY_PRESETS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Booking Status
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucher.bookingStatus}
                    onChange={(e) => updateField('bookingStatus', e.target.value.toUpperCase())}
                    placeholder="DEFINITE"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-extrabold uppercase tracking-wider"
                  />
                  <select
                    onChange={(e) => updateField('bookingStatus', e.target.value)}
                    value={voucher.bookingStatus}
                    className="px-2 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Greeting / Salutation
                </label>
                <input
                  type="text"
                  value={voucher.greeting}
                  onChange={(e) => updateField('greeting', e.target.value)}
                  placeholder="AsSalam O Alikum"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Greeting Message Body
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={voucher.greetingSub}
                  onChange={(e) => updateField('greetingSub', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-800"
                />
                <input
                  type="text"
                  value={voucher.greetingText}
                  onChange={(e) => updateField('greetingText', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MULTI-ROW BOOKING DETAILS ================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stay &amp; Room Bookings
                </h3>
                <p className="text-xs text-slate-500">
                  Nights are automatically calculated from Check-In &amp; Check-Out dates.
                </p>
              </div>
              <button
                type="button"
                onClick={addBookingRow}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stay Entry
              </button>
            </div>

            <div className="space-y-3">
              {voucher.bookingRows.map((row, index) => (
                <div
                  key={row.id || index}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      Entry #{index + 1} — {row.roomType || 'Room'}
                    </span>
                    {voucher.bookingRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBookingRow(index)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Check In
                      </label>
                      <input
                        type="date"
                        value={row.checkIn}
                        onChange={(e) => handleRowChange(index, 'checkIn', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Check Out
                      </label>
                      <input
                        type="date"
                        value={row.checkOut}
                        onChange={(e) => handleRowChange(index, 'checkOut', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Nights (Auto)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={row.nights}
                        onChange={(e) => handleRowChange(index, 'nights', parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 bg-amber-50/50 border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        No. of Rooms
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={row.noOfRooms}
                        onChange={(e) => handleRowChange(index, 'noOfRooms', parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Room Type
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={row.roomType}
                          onChange={(e) => handleRowChange(index, 'roomType', e.target.value)}
                          placeholder="e.g. Quad CV"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                        />
                        <div className="flex gap-1 mt-1 overflow-x-auto py-0.5">
                          {['Quad CV', 'Standard Twin', 'Triple Room', 'Deluxe'].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handleRowChange(index, 'roomType', p)}
                              className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-100 whitespace-nowrap"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Meal Plan
                      </label>
                      <select
                        value={row.meal}
                        onChange={(e) => handleRowChange(index, 'meal', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                      >
                        {MEAL_PLAN_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        HCN (Hotel Confirmation No.)
                      </label>
                      <input
                        type="text"
                        value={row.hcn}
                        onChange={(e) => handleRowChange(index, 'hcn', e.target.value)}
                        placeholder="e.g. 117441"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TERMS & CONDITIONS ================= */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Terms &amp; Conditions
                </h3>
                <p className="text-xs text-slate-500">
                  Every clause is fully editable to match specific package requirements.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetTerms}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Reference
                </button>
                <button
                  type="button"
                  onClick={addTerm}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Clause
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {voucher.termsAndConditions.map((term, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 select-none text-xs w-4">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Remove clause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: EMERGENCY & COMPANY INFO ================= */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Emergency Contact Details
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Printed directly above the &quot;THANK YOU&quot; footer note on the voucher.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={voucher.emergencyContact.name}
                    onChange={(e) =>
                      updateField('emergencyContact', {
                        ...voucher.emergencyContact,
                        name: e.target.value,
                      })
                    }
                    placeholder="Hassan Ghaziani"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Phone Number
                  </label>
                  <input
                    type="text"
                    value={voucher.emergencyContact.phone}
                    onChange={(e) =>
                      updateField('emergencyContact', {
                        ...voucher.emergencyContact,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+92 336 2169622"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Agency Header Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Government License Number
                  </label>
                  <input
                    type="text"
                    value={voucher.companyInfo.licenseNo}
                    onChange={(e) =>
                      updateField('companyInfo', {
                        ...voucher.companyInfo,
                        licenseNo: e.target.value,
                      })
                    }
                    placeholder="GL : 5905"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Logo Image (Optional)
                  </label>
                  {voucher.companyInfo.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={voucher.companyInfo.logoUrl}
                        alt="Custom Logo"
                        className="h-10 max-w-32 object-contain border border-slate-200 rounded p-1"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Remove Logo (Use Default Vector)
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-xs text-slate-600">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span>Upload PNG / JPEG Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Office Address Lines
                </label>
                <div className="space-y-1.5">
                  {voucher.companyInfo.addressLines.map((line, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const newLines = [...voucher.companyInfo.addressLines];
                        newLines[idx] = e.target.value;
                        updateField('companyInfo', {
                          ...voucher.companyInfo,
                          addressLines: newLines,
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-slate-700"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: QR CODE & VERIFICATION ================= */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                QR Code Configuration
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Customize the scannable code generated on the hotel voucher.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="showQrToggle"
                checked={voucher.qrCodeConfig.showOnVoucher}
                onChange={(e) =>
                  updateField('qrCodeConfig', {
                    ...voucher.qrCodeConfig,
                    showOnVoucher: e.target.checked,
                  })
                }
                className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
              />
              <label htmlFor="showQrToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                Display Scannable QR Code on Voucher
              </label>
            </div>

            {voucher.qrCodeConfig.showOnVoucher && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  QR Code Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Compact (44px)', value: 44, badge: 'Standard' },
                    { label: 'Small (50px)', value: 50 },
                    { label: 'Medium (60px)', value: 60 },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() =>
                        updateField('qrCodeConfig', {
                          ...voucher.qrCodeConfig,
                          size: s.value,
                        })
                      }
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                        (voucher.qrCodeConfig.size || 44) === s.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>{s.label}</div>
                      {s.badge && <div className="text-[9px] opacity-80">{s.badge}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                QR Code Content Type
              </label>

              <div className="space-y-2">
                {[
                  {
                    type: 'verification_url' as QRContentType,
                    title: 'Live Verification Link (Recommended)',
                    desc: 'Opens the Aero Adventure Verification Page with official booking certificate and validation badge.',
                  },
                  {
                    type: 'booking_summary' as QRContentType,
                    title: 'Offline Booking Summary',
                    desc: 'Encodes complete reservation details (Guest, Hotel, City, Dates, Emergency Contact) directly into the QR code.',
                  },
                  {
                    type: 'invoice_hcn' as QRContentType,
                    title: 'Invoice & HCN References',
                    desc: 'Encodes Invoice number, HCN, and guest name for quick front-desk terminal lookup.',
                  },
                  {
                    type: 'custom_text' as QRContentType,
                    title: 'Custom URL / Message',
                    desc: 'Enter custom portal URL, booking link, or message.',
                  },
                ].map((opt) => (
                  <label
                    key={opt.type}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      voucher.qrCodeConfig.type === opt.type
                        ? 'border-slate-900 bg-slate-50/70'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="qrType"
                      checked={voucher.qrCodeConfig.type === opt.type}
                      onChange={() =>
                        updateField('qrCodeConfig', {
                          ...voucher.qrCodeConfig,
                          type: opt.type,
                        })
                      }
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {voucher.qrCodeConfig.type === 'custom_text' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Content String
                  </label>
                  <input
                    type="text"
                    value={voucher.qrCodeConfig.customText || ''}
                    onChange={(e) =>
                      updateField('qrCodeConfig', {
                        ...voucher.qrCodeConfig,
                        customText: e.target.value,
                      })
                    }
                    placeholder="https://aero-adventure.travel/verify/117441"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unique Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={voucher.verificationCode}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
