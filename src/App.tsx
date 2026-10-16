import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Printer,
  FileDown,
  Save,
  RotateCcw,
  Copy,
  Plus,
  List,
  ShieldCheck,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Sliders,
  Eye,
  Edit3,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { HotelVoucher } from './types/voucher';
import {
  createDefaultReferenceVoucher,
  createNewBlankVoucher,
} from './utils/voucherHelpers';
import {
  getSavedVouchers,
  saveVoucher,
  deleteVoucher,
  getNextInvoiceNumber,
  getVoucherByInvoiceOrCode,
} from './utils/storage';
import { downloadVoucherPdf, printVoucher } from './utils/pdfGenerator';
import { VoucherDocument } from './components/VoucherDocument';
import { VoucherEditor } from './components/VoucherEditor';
import { SavedVouchersView } from './components/SavedVouchersView';
import { VerificationModal } from './components/VerificationModal';
import { AeroLogo } from './components/AeroLogo';

export default function App() {
  // Navigation: 'editor' | 'saved'
  const [activeView, setActiveView] = useState<'editor' | 'saved'>('editor');

  // Vouchers state
  const [savedVouchers, setSavedVouchers] = useState<HotelVoucher[]>([]);
  const [currentVoucher, setCurrentVoucher] = useState<HotelVoucher>(createDefaultReferenceVoucher());

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<number>(0.9); // scale for preview pane
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [voucherToVerify, setVoucherToVerify] = useState<HotelVoucher | null>(null);

  // Load vouchers from storage on mount & check URL parameters
  useEffect(() => {
    const list = getSavedVouchers();
    setSavedVouchers(list);
    if (list.length > 0) {
      setCurrentVoucher(list[0]);
    }

    // Check if initial URL has verification query
    const urlParams = new URLSearchParams(window.location.search);
    const verifyParam = urlParams.get('verify') || urlParams.get('code');
    if (verifyParam) {
      const match = getVoucherByInvoiceOrCode(verifyParam);
      setVoucherToVerify(match || null);
      setVerifyModalOpen(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Actions
  const handleSaveVoucher = () => {
    saveVoucher(currentVoucher);
    const refreshed = getSavedVouchers();
    setSavedVouchers(refreshed);
    showToast(`Voucher #${currentVoucher.invoiceNo} saved successfully!`);
  };

  const handleCreateNew = () => {
    const nextInv = getNextInvoiceNumber();
    const newVoucher = createNewBlankVoucher(nextInv);
    setCurrentVoucher(newVoucher);
    setActiveView('editor');
    setMobileTab('form');
    showToast(`Created new blank voucher #${nextInv}`);
  };

  const handleDuplicateCurrent = (source?: HotelVoucher) => {
    const target = source || currentVoucher;
    const nextInv = getNextInvoiceNumber();
    const duplicated: HotelVoucher = {
      ...target,
      id: 'vch_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      invoiceNo: nextInv,
      voucherDate: new Date().toISOString().split('T')[0],
      verificationCode: `AERO-${nextInv}-DUP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveVoucher(duplicated);
    const refreshed = getSavedVouchers();
    setSavedVouchers(refreshed);
    setCurrentVoucher(duplicated);
    setActiveView('editor');
    showToast(`Duplicated voucher to new Invoice #${nextInv}`);
  };

  const handleResetToDefaultReference = () => {
    if (window.confirm('Reset this voucher to the original reference template (Abdul Basit - Taiba)?')) {
      const def = createDefaultReferenceVoucher();
      setCurrentVoucher(def);
      showToast('Reset to reference template');
    }
  };

  const handleSelectFromSaved = (v: HotelVoucher) => {
    setCurrentVoucher(v);
    setActiveView('editor');
  };

  const handleDeleteSaved = (id: string) => {
    deleteVoucher(id);
    const refreshed = getSavedVouchers();
    setSavedVouchers(refreshed);
    if (currentVoucher.id === id && refreshed.length > 0) {
      setCurrentVoucher(refreshed[0]);
    }
    showToast('Voucher deleted from records');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadVoucherPdf('printable-voucher', currentVoucher.invoiceNo, currentVoucher.guestName);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. You can also use the Print button.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    printVoucher();
  };

  const handleOpenVerification = (v?: HotelVoucher) => {
    setVoucherToVerify(v || currentVoucher);
    setVerifyModalOpen(true);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedVouchers, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Aero_Adventure_Vouchers_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    showToast('Exported vouchers database');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('aero_adventure_hotel_vouchers_v1', JSON.stringify(parsed));
          setSavedVouchers(parsed);
          setCurrentVoucher(parsed[0]);
          showToast(`Successfully imported ${parsed.length} vouchers!`);
        } else {
          alert('Invalid voucher backup file.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans">
      {/* ================= TOP NAVIGATION BAR ================= */}
      {/* Strict 3-zone Top Bar Contract: Brand Wordmark - Clean Nav Links - 1 Primary Action */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <AeroLogo licenseNo="GL : 5905" className="scale-90 origin-left" />
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-1 border-b-2 ${
                activeView === 'editor'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Voucher Builder
            </button>

            <button
              type="button"
              onClick={() => setActiveView('saved')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-1 border-b-2 ${
                activeView === 'saved'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
              Saved Records ({savedVouchers.length})
            </button>

            <button
              type="button"
              onClick={() => handleOpenVerification()}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-1 border-b-2 border-transparent text-slate-600"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verify Certificate
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Voucher</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex border-t border-slate-200 bg-slate-50 text-xs font-semibold px-4 py-2 gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className={`whitespace-nowrap ${
              activeView === 'editor' ? 'text-slate-900 font-bold underline' : 'text-slate-600'
            }`}
          >
            Voucher Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveView('saved')}
            className={`whitespace-nowrap ${
              activeView === 'saved' ? 'text-slate-900 font-bold underline' : 'text-slate-600'
            }`}
          >
            Saved Records ({savedVouchers.length})
          </button>
          <button
            type="button"
            onClick={() => handleOpenVerification()}
            className="text-emerald-700 whitespace-nowrap flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* ================= VIEW 1: VOUCHER BUILDER & LIVE PREVIEW ================= */}
        {activeView === 'editor' ? (
          <div className="space-y-4">
            {/* Action Bar with all prompt-requested buttons */}
            <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider mr-1">
                  Voucher #{currentVoucher.invoiceNo}
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  · {currentVoucher.guestName || 'Unnamed Guest'} ({currentVoucher.hotelName || 'No Hotel'})
                </span>
              </div>

              {/* Primary Action Buttons from Section 6 */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Save / Generate Button */}
                <button
                  type="button"
                  onClick={handleSaveVoucher}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Save this voucher to persistent records"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Voucher</span>
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                  title="Download clean A4 PDF of the voucher"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                {/* Print Voucher Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Print voucher directly"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* Duplicate Voucher Button */}
                <button
                  type="button"
                  onClick={() => handleDuplicateCurrent()}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Duplicate voucher for another customer with next invoice ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                {/* Reset to Reference Form */}
                <button
                  type="button"
                  onClick={handleResetToDefaultReference}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                  title="Reset form to original reference voucher (Abdul Basit)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>

                {/* View Saved Vouchers Shortcut */}
                <button
                  type="button"
                  onClick={() => setActiveView('saved')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                  title="View all saved vouchers list"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>View Saved</span>
                </button>
              </div>
            </div>

            {/* Mobile View Toggle (Form vs Live Preview) */}
            <div className="lg:hidden flex rounded-lg p-1 bg-slate-200 border border-slate-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMobileTab('form')}
                className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                  mobileTab === 'form' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Edit Voucher Details
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                  mobileTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Live A4 Preview
              </button>
            </div>

            {/* Split Screen Layout: Left Form Editor (50%) & Right Live Document Preview (50%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Editor */}
              <div
                className={`lg:col-span-6 space-y-4 ${
                  mobileTab === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                <VoucherEditor
                  voucher={currentVoucher}
                  onChange={(updated) => setCurrentVoucher(updated)}
                  onResetToDefault={handleResetToDefaultReference}
                />
              </div>

              {/* Right Column: Live Voucher Document Preview */}
              <div
                className={`lg:col-span-6 ${
                  mobileTab === 'form' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="sticky top-20 space-y-2">
                  {/* Preview Toolbar with Zoom Controls */}
                  <div className="no-print bg-slate-200/90 backdrop-blur-xs p-2 px-3 rounded-lg border border-slate-300 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Live A4 Preview</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Instant update on edit)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.max(0.6, z - 0.1))}
                        className="p-1 hover:bg-slate-300 rounded text-slate-700"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono tabular-nums w-10 text-center font-bold">
                        {Math.round(previewZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.min(1.2, z + 0.1))}
                        className="p-1 hover:bg-slate-300 rounded text-slate-700"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(0.9)}
                        className="px-1.5 py-0.5 text-[10px] hover:bg-slate-300 rounded font-medium ml-1"
                        title="Reset scale"
                      >
                        Fit
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Container with Zoom Scaling */}
                  <div className="bg-slate-300/60 p-4 rounded-xl border border-slate-300/80 overflow-auto max-h-[calc(100vh-140px)] flex justify-center shadow-inner">
                    <div
                      style={{
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.15s ease-out',
                      }}
                    >
                      <VoucherDocument voucher={currentVoucher} id="printable-voucher" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: SAVED VOUCHERS MANAGEMENT ================= */
          <SavedVouchersView
            vouchers={savedVouchers}
            onSelectVoucher={handleSelectFromSaved}
            onDuplicateVoucher={handleDuplicateCurrent}
            onDeleteVoucher={handleDeleteSaved}
            onCreateNew={handleCreateNew}
            onVerifyVoucher={handleOpenVerification}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
          />
        )}
      </main>

      {/* ================= DEDICATED PRINT CONTAINER (PRINT MEDIA ONLY) ================= */}
      {/* Ensures window.print() outputs the exact unscaled A4 document without dashboard controls */}
      <div className="print-only hidden">
        <VoucherDocument voucher={currentVoucher} id="print-media-voucher" />
      </div>

      {/* ================= VERIFICATION MODAL / POPUP ================= */}
      <VerificationModal
        voucher={voucherToVerify}
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onViewVoucher={handleSelectFromSaved}
        onSearchVoucher={(q) => getVoucherByInvoiceOrCode(q)}
      />

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="no-print mt-auto py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Aero Adventure Travel &amp; Tours · License GL : 5905 · Karachi, Pakistan
          </div>
          <div className="text-[11px] text-slate-400">
            Emergency Hotline: +92 336 2169622
          </div>
        </div>
      </footer>
    </div>
  );
}
