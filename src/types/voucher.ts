export interface BookingRow {
  id: string;
  sNo: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  roomType: string;
  nights: number;
  noOfRooms: number;
  meal: string;
  hcn: string;
}

export type QRContentType = 'verification_url' | 'booking_summary' | 'invoice_hcn' | 'custom_text';

export interface QRCodeConfig {
  type: QRContentType;
  customText?: string;
  includeHcn: boolean;
  size: number;
  showOnVoucher: boolean;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  licenseNo: string;
  phones: string[];
  addressLines: string[];
  logoUrl?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface HotelVoucher {
  id: string;
  invoiceNo: string;
  voucherDate: string; // YYYY-MM-DD
  guestName: string;
  nationality: string;
  hotelName: string;
  city: string;
  bookingStatus: string;
  greeting: string;
  greetingSub: string;
  greetingText: string;
  bookingRows: BookingRow[];
  termsAndConditions: string[];
  emergencyContact: EmergencyContact;
  companyInfo: CompanyInfo;
  qrCodeConfig: QRCodeConfig;
  verificationCode: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
