import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { HotelVoucher } from '../types/voucher';

interface VoucherQRCodeProps {
  voucher: HotelVoucher;
  size?: number;
  className?: string;
  showCaption?: boolean;
}

export const VoucherQRCode: React.FC<VoucherQRCodeProps> = ({
  voucher,
  size = 46,
  className = '',
  showCaption = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  const getQRContent = (): string => {
    const config = voucher.qrCodeConfig;
    if (config.type === 'custom_text' && config.customText) {
      return config.customText;
    }

    if (config.type === 'invoice_hcn') {
      const hcns = voucher.bookingRows.map(r => r.hcn).filter(Boolean).join(', ');
      return `AERO-VOUCHER:${voucher.invoiceNo}|HCN:${hcns || 'PENDING'}|GUEST:${voucher.guestName}`;
    }

    if (config.type === 'booking_summary') {
      const firstRow = voucher.bookingRows[0];
      return `AERO ADVENTURE TRAVEL & TOURS
INV: ${voucher.invoiceNo} | ${voucher.voucherDate}
GUEST: ${voucher.guestName} (${voucher.nationality})
HOTEL: ${voucher.hotelName}, ${voucher.city}
STATUS: ${voucher.bookingStatus}
DATES: ${firstRow ? `${firstRow.checkIn} to ${firstRow.checkOut} (${firstRow.nights}N)` : 'N/A'}
EMERGENCY: ${voucher.emergencyContact.phone}`;
    }

    // Default: Verification URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aero-adventure.travel';
    return `${origin}/?verify=${encodeURIComponent(voucher.invoiceNo)}&code=${encodeURIComponent(voucher.verificationCode)}`;
  };

  useEffect(() => {
    const content = getQRContent();
    const qrDimension = Math.min(Math.max(size, 36), 68);
    QRCode.toDataURL(content, {
      width: qrDimension,
      margin: 0,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setDataUrl(url))
      .catch(err => {
        console.error('Failed to generate QR code:', err);
      });
  }, [voucher, size]);

  if (!voucher.qrCodeConfig.showOnVoucher) {
    return null;
  }

  const effectiveSize = Math.min(Math.max(size, 36), 68);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {dataUrl ? (
        <div className="bg-white p-0.5 rounded border border-slate-300 inline-block">
          <img
            src={dataUrl}
            alt="Voucher QR Code"
            width={effectiveSize}
            height={effectiveSize}
            className="block"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          style={{ width: effectiveSize, height: effectiveSize }}
          className="bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-500 font-mono"
        >
          QR
        </div>
      )}
      {showCaption && (
        <span className="text-[6.5px] font-bold text-slate-600 tracking-wider uppercase mt-0.5">
          Verify
        </span>
      )}
    </div>
  );
};
