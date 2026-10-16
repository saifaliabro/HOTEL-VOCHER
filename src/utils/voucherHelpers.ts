import { HotelVoucher, BookingRow } from '../types/voucher';

export const DEFAULT_TERMS: string[] = [
  "No cancellation for Ramzan, high season & masar approved booking.",
  "Full booking amount will be charged in case of no show.",
  "Please settle the reservation amount before option date, otherwise reservation will be cancelled without any prior notice.",
  "We require 72 hours advance notice for any amendments.",
  "Check-in-time not before 17:00 hrs. & check-out-time before 12:00 hrs.",
  "5 star hotel room types are all standard twin bed after guest checked in extra beds will be provided for triple / quad.",
  "Hotel confirmation numbers will be provided one day or same day of hotel check in"
];

export const MEAL_PLAN_OPTIONS = [
  { value: 'RO', label: 'RO - Room Only' },
  { value: 'BB', label: 'BB - Bed & Breakfast' },
  { value: 'HB', label: 'HB - Half Board (Breakfast + Dinner)' },
  { value: 'FB', label: 'FB - Full Board (All Meals)' },
  { value: 'AI', label: 'AI - All Inclusive' },
  { value: 'SAHOOR', label: 'SAHOOR - Ramadan Sahoor Only' },
  { value: 'IFTAR', label: 'IFTAR - Ramadan Iftar Only' },
  { value: 'SAHOOR+IFTAR', label: 'SAHOOR & IFTAR - Ramadan Full' },
];

export const ROOM_TYPE_PRESETS = [
  'Single Room',
  'Standard Twin',
  'Double Bed',
  'Triple Room',
  'Quad CV',
  'Quad Standard',
  'Family Suite',
  'Junior Suite',
  'Deluxe Haram View',
  'Kaaba View Suite',
  'City View Quad',
  'Executive Suite',
];

export const CITY_PRESETS = [
  'MADINAH',
  'MAKKAH',
  'JEDDAH',
  'RIYADH',
  'DUBAI',
  'ISTANBUL',
  'KARACHI',
  'ISLAMABAD',
  'LAHORE',
  'DOHA',
  'BAHRAIN',
  'MUSCAT',
];

export const STATUS_OPTIONS = [
  { value: 'DEFINITE', label: 'DEFINITE (Confirmed)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'TENTATIVE', label: 'TENTATIVE (Pending)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'ON REQUEST', label: 'ON REQUEST', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'CANCELLED', label: 'CANCELLED', color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

/**
 * Calculates nights between two dates (difference, not inclusive count)
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY or DD-MM-YYYY
 */
export function formatDateDisplay(dateStr: string, separator: '/' | '-' = '/'): string {
  if (!dateStr) return '';
  // Check if already in DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateStr)) {
    return dateStr.replace(/[-/]/g, separator);
  }
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}${separator}${month}${separator}${year}`;
  }
  return dateStr;
}

/**
 * Formats a number to 7-digit invoice string like '0001001'
 */
export function formatInvoiceNumber(num: number): string {
  return String(num).padStart(7, '0');
}

/**
 * Extract numerical portion of invoice
 */
export function parseInvoiceNumber(inv: string): number {
  const match = inv.replace(/[^0-9]/g, '');
  return match ? parseInt(match, 10) : 1001;
}

/**
 * Generate a unique verification token
 */
export function generateVerificationCode(invoiceNo: string, guestName: string): string {
  const cleanInv = invoiceNo.replace(/[^a-zA-Z0-9]/g, '');
  const cleanGuest = guestName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AERO-${cleanInv}-${cleanGuest || 'GUEST'}-${rand}`;
}

export function createDefaultReferenceVoucher(): HotelVoucher {
  return {
    id: 'ref-default-0001001',
    invoiceNo: '0001001',
    voucherDate: '2026-10-08',
    guestName: 'Abdul basit',
    nationality: 'PAKISTANI',
    hotelName: 'Astoneast Taiba',
    city: 'MADINAH',
    bookingStatus: 'DEFINITE',
    greeting: 'AsSalam O Alikum',
    greetingSub: 'Greetings From Aero Adventure Travel & Tours!',
    greetingText: 'Thank you for your booking, Please find the below booking for your kind perusal',
    bookingRows: [
      {
        id: 'row-1',
        sNo: 1,
        checkIn: '2026-10-12',
        checkOut: '2026-10-20',
        roomType: 'Quad CV',
        nights: 8,
        noOfRooms: 2,
        meal: 'RO',
        hcn: '117441'
      }
    ],
    termsAndConditions: [...DEFAULT_TERMS],
    emergencyContact: {
      name: 'Hassan Ghaziani',
      phone: '+92 336 2169622'
    },
    companyInfo: {
      name: 'AERO ADVENTURE',
      tagline: 'TRAVEL AND TOURS',
      licenseNo: 'GL : 5905',
      phones: [
        '+92 336 2169622 (HASSAN GHAZIANI)',
        '+92 332 3432227 (YAHYA GHAZIANI)'
      ],
      addressLines: [
        'OFFICE NO. M-2 MEZZAINE FLOOR, ALAMGIR TERRACE,',
        'PLOT NO. Z-11 COMMERCIAL 1, BLOCK 3, MAQBOOLABAD',
        'CO-OPERATIVE HOUSING SOCIETY, KARACHI, PAKISTAN'
      ]
    },
    qrCodeConfig: {
      type: 'verification_url',
      includeHcn: true,
      size: 46,
      showOnVoucher: true
    },
    verificationCode: 'AERO-0001001-ABDU-8X42',
    createdAt: '2026-10-08T10:00:00.000Z',
    updatedAt: '2026-10-08T10:00:00.000Z',
    notes: 'Primary reference booking for Abdul Basit - Umrah 2026'
  };
}

export function createNewBlankVoucher(nextInvoiceNo: string): HotelVoucher {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0];
  
  return {
    id: 'vch_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    invoiceNo: nextInvoiceNo,
    voucherDate: today,
    guestName: '',
    nationality: 'PAKISTANI',
    hotelName: '',
    city: 'MADINAH',
    bookingStatus: 'DEFINITE',
    greeting: 'AsSalam O Alikum',
    greetingSub: 'Greetings From Aero Adventure Travel & Tours!',
    greetingText: 'Thank you for your booking, Please find the below booking for your kind perusal',
    bookingRows: [
      {
        id: 'row_' + Date.now(),
        sNo: 1,
        checkIn: tomorrow,
        checkOut: nextWeek,
        roomType: 'Standard Twin',
        nights: calculateNights(tomorrow, nextWeek),
        noOfRooms: 1,
        meal: 'RO',
        hcn: ''
      }
    ],
    termsAndConditions: [...DEFAULT_TERMS],
    emergencyContact: {
      name: 'Hassan Ghaziani',
      phone: '+92 336 2169622'
    },
    companyInfo: {
      name: 'AERO ADVENTURE',
      tagline: 'TRAVEL AND TOURS',
      licenseNo: 'GL : 5905',
      phones: [
        '+92 336 2169622 (HASSAN GHAZIANI)',
        '+92 332 3432227 (YAHYA GHAZIANI)'
      ],
      addressLines: [
        'OFFICE NO. M-2 MEZZAINE FLOOR, ALAMGIR TERRACE,',
        'PLOT NO. Z-11 COMMERCIAL 1, BLOCK 3, MAQBOOLABAD',
        'CO-OPERATIVE HOUSING SOCIETY, KARACHI, PAKISTAN'
      ]
    },
    qrCodeConfig: {
      type: 'verification_url',
      includeHcn: true,
      size: 46,
      showOnVoucher: true
    },
    verificationCode: generateVerificationCode(nextInvoiceNo, 'NEW'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
