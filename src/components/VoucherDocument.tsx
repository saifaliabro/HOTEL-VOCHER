import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { HotelVoucher } from '../types/voucher';
import { formatDateDisplay } from '../utils/voucherHelpers';
import { AeroLogo } from './AeroLogo';
import { VoucherQRCode } from './VoucherQRCode';

interface VoucherDocumentProps {
  voucher: HotelVoucher;
  id?: string;
  className?: string;
}

export const VoucherDocument: React.FC<VoucherDocumentProps> = ({
  voucher,
  id = 'printable-voucher',
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`voucher-paper bg-white text-slate-900 mx-auto w-full max-w-[794px] min-h-[1080px] p-8 md:p-12 shadow-md print:shadow-none print:p-0 print:m-0 flex flex-col justify-between text-[13px] leading-relaxed relative ${className}`}
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div>
        {/* ================= HEADER SECTION ================= */}
        <div className="flex justify-between items-start pb-2 gap-4">
          {/* Left: Brand Logo & GL */}
          <div className="pt-1">
            <AeroLogo
              customLogoUrl={voucher.companyInfo.logoUrl}
              licenseNo={voucher.companyInfo.licenseNo}
            />
          </div>

          {/* Right: Contact Numbers & Address */}
          <div className="text-right text-[11px] leading-tight text-slate-800 space-y-1">
            {voucher.companyInfo.phones.map((phone, idx) => (
              <div key={idx} className="flex items-center justify-end gap-1.5 font-bold tracking-tight">
                <span>{phone}</span>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-900 text-white shrink-0">
                  <Phone className="w-2 h-2" />
                </span>
              </div>
            ))}

            <div className="pt-0.5 text-slate-700 text-[10px] uppercase font-medium tracking-tight">
              {voucher.companyInfo.addressLines.map((line, idx) => (
                <div key={idx} className="flex items-center justify-end gap-1">
                  <span>{line}</span>
                  {idx === 0 && (
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-900 text-white shrink-0">
                      <MapPin className="w-2 h-2" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= DECORATIVE HEADER DIVIDER BAR ================= */}
        {/* Recreating the signature dark slant & forest/spruce gradient stripe from the reference PDF */}
        <div className="w-full h-4.5 my-3 flex items-stretch overflow-hidden">
          {/* Dark Spruce Accent Slanted Notch */}
          <div className="w-16 sm:w-20 bg-[#24352D] shrink-0 transform -skew-x-20 -ml-2" />
          <div className="w-2 bg-white shrink-0" />
          <div className="w-4 bg-[#2E4438] shrink-0 transform -skew-x-20" />
          <div className="w-2 bg-white shrink-0" />
          {/* Subtle Sage/Spruce Slate Gradient Bar */}
          <div
            className="flex-1"
            style={{
              background: 'linear-gradient(90deg, #4A6759 0%, #648677 50%, #8DAFA0 100%)',
            }}
          />
        </div>

        {/* ================= TITLE ================= */}
        <div className="text-center my-4">
          <h1
            className="text-[26px] md:text-[28px] font-extrabold tracking-wide uppercase text-slate-900 inline-block pb-0.5"
            style={{
              borderBottom: '2.5px solid #0f172a',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            HOTEL VOUCHER
          </h1>
        </div>

        {/* ================= INVOICE & DATE ROW ================= */}
        <div className="flex justify-between items-center text-[13px] font-bold text-slate-900 mb-6 pt-1">
          <div>
            <span className="font-semibold text-slate-800">INVOICE No. </span>
            <span className="tracking-wide font-extrabold">{voucher.invoiceNo}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">DATE: </span>
            <span className="tracking-wide font-extrabold">
              {formatDateDisplay(voucher.voucherDate, '-')}
            </span>
          </div>
        </div>

        {/* ================= SALUTATION & GREETING ================= */}
        <div className="space-y-1 text-slate-900 mb-6 text-[13px]">
          <p className="font-bold text-[14px] text-slate-900">
            {voucher.greeting}
          </p>
          <p className="font-semibold text-slate-800">
            {voucher.greetingSub}
          </p>
          <p className="text-slate-700 text-[12.5px]">
            {voucher.greetingText}
          </p>
        </div>

        {/* ================= GUEST & HOTEL DETAILS (2 COLUMNS) ================= */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-[13px] font-bold text-slate-900 uppercase">
          <div className="space-y-2">
            <div>
              <span className="text-slate-700 font-semibold">GUEST NAME: </span>
              <span className="text-slate-950 font-extrabold">{voucher.guestName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-700 font-semibold">HOTEL NAME: </span>
              <span className="text-slate-950 font-extrabold">{voucher.hotelName || '—'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-700 font-semibold">NATIONALITY: </span>
              <span className="text-slate-950 font-extrabold">{voucher.nationality || 'PAKISTANI'}</span>
            </div>
            <div>
              <span className="text-slate-700 font-semibold">CITY: </span>
              <span className="text-slate-950 font-extrabold">{voucher.city || '—'}</span>
            </div>
          </div>
        </div>

        {/* ================= BOOKING STATUS ================= */}
        <div className="text-center my-5">
          <span className="text-[17px] font-extrabold tracking-[0.25em] text-slate-900 uppercase">
            {voucher.bookingStatus}
          </span>
        </div>

        {/* ================= BOOKING DETAILS TABLE ================= */}
        <div className="mb-6">
          <div className="text-center text-[12px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            BOOKING DETAILS
          </div>

          <div className="w-full border border-slate-700 overflow-hidden">
            <table className="w-full text-center border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-[#232932] text-white font-bold uppercase text-[11px] tracking-tight">
                  <th className="py-2 px-1 border-r border-slate-600 w-12 font-bold">S.No</th>
                  <th className="py-2 px-2 border-r border-slate-600 font-bold">Check In</th>
                  <th className="py-2 px-2 border-r border-slate-600 font-bold">Check Out</th>
                  <th className="py-2 px-3 border-r border-slate-600 font-bold text-left">Room Type</th>
                  <th className="py-2 px-2 border-r border-slate-600 w-16 font-bold">Nights</th>
                  <th className="py-2 px-2 border-r border-slate-600 w-24 font-bold">No. of Rooms</th>
                  <th className="py-2 px-2 border-r border-slate-600 w-14 font-bold">Meal</th>
                  <th className="py-2 px-3 w-24 font-bold">HCN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400 bg-white text-slate-900 font-medium">
                {voucher.bookingRows.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-1 border-r border-slate-400 font-bold text-slate-900">
                      {row.sNo || index + 1}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-400 font-bold tabular-nums">
                      {formatDateDisplay(row.checkIn, '/')}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-400 font-bold tabular-nums">
                      {formatDateDisplay(row.checkOut, '/')}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-400 font-bold text-left">
                      {row.roomType || 'Standard'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-400 font-bold tabular-nums">
                      {row.nights}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-400 font-bold tabular-nums">
                      {row.noOfRooms}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-400 font-bold uppercase">
                      {row.meal || 'RO'}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-950 tabular-nums">
                      {row.hcn || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= TERMS & CONDITIONS ================= */}
        <div className="mb-6 pt-1">
          <div className="text-[12px] font-bold text-slate-900 uppercase tracking-tight mb-1.5">
            TERMS &amp; CONDITIONS:
          </div>
          <ul className="text-[11px] leading-[1.45] text-slate-700 space-y-1">
            {voucher.termsAndConditions.map((term, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="font-bold text-slate-900 select-none shrink-0">*</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= FOOTER / EMERGENCY & CLOSING ================= */}
      <div className="mt-auto pt-4">
        {/* Top border above emergency contact */}
        <div className="w-full border-t border-slate-400 pt-3">
          <div className="text-center text-[12px] text-slate-900">
            <span className="font-semibold text-slate-800">Emergency Contact Details: </span>
            <span className="font-bold text-slate-950">
              {voucher.emergencyContact.phone} ({voucher.emergencyContact.name})
            </span>
          </div>
        </div>

        {/* Thank You message with optional small QR code layout */}
        <div className="relative mt-4 mb-2 flex items-center justify-center">
          <div className="text-center">
            <span
              className="text-[26px] md:text-[28px] font-extrabold italic tracking-tight text-slate-900"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              THANK YOU!!!
            </span>
          </div>

          {/* Discreet Small QR Code positioned in bottom right corner */}
          {voucher.qrCodeConfig.showOnVoucher && (
            <div className="absolute right-0 bottom-0 text-right">
              <VoucherQRCode
                voucher={voucher}
                size={voucher.qrCodeConfig.size || 46}
                showCaption={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
