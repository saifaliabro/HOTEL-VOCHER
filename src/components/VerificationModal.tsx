import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  User,
  Phone,
  Printer,
  FileDown,
  X
} from 'lucide-react';
import { HotelVoucher } from '../types/voucher';
import { formatDateDisplay } from '../utils/voucherHelpers';
import { AeroLogo } from './AeroLogo';

interface VerificationModalProps {
  voucher: HotelVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onViewVoucher?: (voucher: HotelVoucher) => void;
  onSearchVoucher: (query: string) => HotelVoucher | undefined;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onViewVoucher,
  onSearchVoucher,
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [currentVoucher, setCurrentVoucher] = useState<HotelVoucher | null>(voucher);
  const [searched, setSearched] = useState(false);

  // Sync with prop when prop changes
  React.useEffect(() => {
    setCurrentVoucher(voucher);
    setSearched(false);
  }, [voucher]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const found = onSearchVoucher(searchCode.trim());
    setCurrentVoucher(found || null);
    setSearched(true);
  };

  const isVerified = Boolean(currentVoucher);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <AeroLogo className="scale-85 origin-left" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search query box */}
        <div className="p-4 px-6 bg-slate-100 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Invoice No, Verification Code, or HCN..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Verification Status Card */}
        <div className="p-6">
          {isVerified && currentVoucher ? (
            <div className="space-y-5">
              {/* Green Verified Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wide">
                    Official Authentic Voucher Verified
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    This booking has been verified directly in the Aero Adventure Travel &amp; Tours
                    central database.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-emerald-800 font-semibold">
                    Verification Code: {currentVoucher.verificationCode}
                  </div>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Invoice Number:</span>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {currentVoucher.invoiceNo}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Booking Status:</span>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {currentVoucher.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">Guest Name:</span>
                    <div className="font-bold text-slate-900">{currentVoucher.guestName}</div>
                    <div className="text-[10px] text-slate-500">{currentVoucher.nationality}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Hotel &amp; City:</span>
                    <div className="font-bold text-slate-900">{currentVoucher.hotelName}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{currentVoucher.city}</div>
                  </div>
                </div>

                {/* Stays breakdown */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium text-xs block mb-1">
                    Stay Details:
                  </span>
                  <div className="space-y-1.5">
                    {currentVoucher.bookingRows.map((row, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">
                            {formatDateDisplay(row.checkIn, '/')} to {formatDateDisplay(row.checkOut, '/')}
                          </span>
                          <span className="text-slate-500 ml-2">
                            ({row.nights} Nights · {row.roomType} · {row.meal})
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          HCN: {row.hcn || 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between text-slate-600">
                  <span>Emergency Hotline:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentVoucher.emergencyContact.phone} ({currentVoucher.emergencyContact.name})
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {onViewVoucher && (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onViewVoucher(currentVoucher);
                      onClose();
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Open in Voucher Builder
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full mx-auto flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Voucher Record Not Found
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  {searched
                    ? `No matching hotel voucher was found for query "${searchCode}". Please verify the invoice number or hotel confirmation number.`
                    : 'The requested voucher is unverified or has not been issued in this database.'}
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-800">
                <span className="font-bold block mb-0.5">Verification Warning:</span>
                Do not honor any booking document unless it matches a verified reservation from Aero
                Adventure Travel &amp; Tours (GL: 5905). Contact emergency support at +92 336 2169622.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
