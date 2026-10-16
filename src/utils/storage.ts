import { HotelVoucher } from '../types/voucher';
import { createDefaultReferenceVoucher, parseInvoiceNumber, formatInvoiceNumber } from './voucherHelpers';

const STORAGE_KEY = 'aero_adventure_hotel_vouchers_v1';

export function getSavedVouchers(): HotelVoucher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial reference voucher and a second Makkah voucher
      const seedVouchers: HotelVoucher[] = [
        createDefaultReferenceVoucher(),
        {
          ...createDefaultReferenceVoucher(),
          id: 'ref-default-0001002',
          invoiceNo: '0001002',
          voucherDate: '2026-10-09',
          guestName: 'Mohammad Farooq & Family',
          nationality: 'PAKISTANI',
          hotelName: 'Swissotel Al Maqam',
          city: 'MAKKAH',
          bookingStatus: 'DEFINITE',
          bookingRows: [
            {
              id: 'row-201',
              sNo: 1,
              checkIn: '2026-10-20',
              checkOut: '2026-10-27',
              roomType: 'Kaaba View Suite',
              nights: 7,
              noOfRooms: 1,
              meal: 'BB',
              hcn: '984120'
            }
          ],
          verificationCode: 'AERO-0001002-FARO-9Y15',
          createdAt: '2026-10-09T14:30:00.000Z',
          updatedAt: '2026-10-09T14:30:00.000Z',
          notes: 'VIP guest - 7 nights Kaaba view with daily breakfast'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVouchers));
      return seedVouchers;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(v => ({
        ...v,
        qrCodeConfig: {
          ...v.qrCodeConfig,
          size: (v.qrCodeConfig?.size && v.qrCodeConfig.size > 60) ? 44 : (v.qrCodeConfig?.size || 44)
        }
      }));
    }
    return [createDefaultReferenceVoucher()];
  } catch (err) {
    console.error('Error reading saved vouchers from localStorage:', err);
    return [createDefaultReferenceVoucher()];
  }
}

export function saveVoucher(voucher: HotelVoucher): void {
  const current = getSavedVouchers();
  const index = current.findIndex(v => v.id === voucher.id);
  
  const updatedVoucher = {
    ...voucher,
    updatedAt: new Date().toISOString()
  };

  let updatedList: HotelVoucher[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedVoucher;
  } else {
    updatedList = [updatedVoucher, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Error saving voucher to localStorage:', err);
  }
}

export function deleteVoucher(id: string): void {
  const current = getSavedVouchers();
  const filtered = current.filter(v => v.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting voucher from localStorage:', err);
  }
}

export function getVoucherById(id: string): HotelVoucher | undefined {
  const vouchers = getSavedVouchers();
  return vouchers.find(v => v.id === id);
}

export function getVoucherByInvoiceOrCode(query: string): HotelVoucher | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  const vouchers = getSavedVouchers();
  return vouchers.find(v => 
    v.invoiceNo.toLowerCase() === q ||
    v.verificationCode.toLowerCase() === q ||
    v.bookingRows.some(row => row.hcn && row.hcn.toLowerCase() === q)
  );
}

export function getNextInvoiceNumber(): string {
  const vouchers = getSavedVouchers();
  let maxNum = 1000;
  for (const v of vouchers) {
    const num = parseInvoiceNumber(v.invoiceNo);
    if (num > maxNum) {
      maxNum = num;
    }
  }
  return formatInvoiceNumber(maxNum + 1);
}
