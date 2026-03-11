import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Car, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  ClipboardList,
  Clock, 
  X,
  Save,
  Upload,
  Check,
  File,
  Mail,
  Building2,
  Settings,
  Send,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowUpDown,
  MapPin,
  LayoutGrid,
  List,
  MessageCircle,
  History,
  Edit3,
  Shield,
  Bell,
  BarChart3,
  Info,
  FileCheck,
  CheckCircle2,
  Paperclip,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';

const INSURANCE_GARAGE_URLS: Record<string, string> = {
  'כלל': 'https://www.clalbit.co.il/agreementgaragesearch/?txtsearchTypeId=&txtsearchGarageName=&txtsearchCityId=7900&txtsearchRegionId=&txtsearchSpecializationId=',
  'הראל': 'https://www.harel-group.co.il/Insurance/car/information/calculators/Pages/agreement-garage.aspx',
  'הפניקס': 'https://www.fnx.co.il/ituran/garages/',
  'מגדל': 'https://my.migdal.co.il/car-insurance/support/garages-and-appraisers-locator',
  'מנורה': 'https://www.menoramivt.co.il/garage-search/',
  'איילון': 'https://www.ayalon-ins.co.il/providers/garages',
  'ביטוח ישיר': 'https://www.555.co.il/car-insurance/providersearch.html',
  '9 מיליון': 'https://www.555.co.il/car-insurance/providersearch.html',
  'AIG': 'https://www.aig.co.il/customer-service/page/3/?garages-type=garages&garages-area&section-type=garages#1501150777478-a28efd45-b395',
  'ליברה': 'https://www.lbr.co.il/%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%95%D7%AA%D7%91%D7%99%D7%A2%D7%95%D7%AA/%D7%9E%D7%95%D7%A1%D7%9B%D7%99%D7%9D/',
  'וואישור': 'https://www.wesure.co.il/service/garages/',
  'שומרה': 'https://www.shomera.co.il/customer-service/order-garage/',
  'הכשרה': 'https://www.hachshara.co.il/service/garages/',
  'שלמה': 'https://www.shlomo-bit.co.il/car_shops/view',
  'אנקור': 'https://www.nkr.co.il/locating-a-garage/',
};

interface User {
  id: string | number;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  phone?: string;
}

interface ClaimLog {
  id: string | number;
  claim_id: string | number;
  username: string;
  content: string;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Claim {
  id: string | number;
  claim_number?: string;
  policy_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  car_number: string;
  car_model: string;
  claim_date: string;
  status: string;
  claim_type: string;
  description: string;
  insurance_company: string;
  claim_handler?: string;
  agent_id?: string;
  agent_name?: string;
  agent_phone?: string;
  garage_settlement: string;
  garage_name: string;
  garage_phone: string;
  garage_email?: string;
  appraiser_chosen: boolean;
  appraiser_name: string;
  appraiser_phone: string;
  appraiser_email?: string;
  claim_form_path: string;
  appraiser_report_path: string | string[];
  appraiser_invoice_path: string | string[];
  appraiser_photos_path: string | string[];
  garage_invoice_path: string | string[];
  driver_license_path: string;
  driver_license_back_path?: string;
  driver_license_status?: string;
  driver_license_back_status?: string;
  vehicle_license_path: string;
  vehicle_license_status?: string;
  id_copy_path?: string;
  bank_confirmation_path?: string;
  no_claims_path?: string;
  consent_form_path?: string;
  police_report_path?: string;
  power_of_attorney_path?: string;
  no_submission_path?: string;
  lien_confirmation_path?: string;
  accountant_confirmation_path?: string;
  has_lien?: boolean;
  keys_handed_over?: boolean;
  check_delivery_date?: string;
  check_redemption_date?: string;
  third_party_insurance_company?: string;
  tp_agent_name?: string;
  tp_agent_phone?: string;
  tp_insured_name?: string;
  tp_insured_phone?: string;
  tp_car_number?: string;
  follow_up_date?: string;
  secondary_status?: string;
  claim_value?: number;
  estimated_processing_days?: number | string;
  public_notes?: string;
  last_activity_at?: string;
  created_at: string;
  requested_docs?: string[];
  requested_docs_customer?: string[];
  requested_docs_appraiser?: string[];
  requested_docs_garage?: string[];
  has_customer_updates?: boolean;
  customer_updated_docs?: string[];
  customer_address?: string;
  customer_id_number?: string;
  policy_allowed_drivers?: string;
  youngest_driver_age?: string;
  named_drivers?: string;
  youngest_driver_seniority?: string;
  insurance_history?: string;
  required_protection?: string;
  additional_coverages?: string;
  towing_services?: string;
  replacement_car_service?: string;
  glass_lights_service?: string;
  deductible_cancellation?: string;
  policy_file_path?: string;
  driver_license_seniority_extracted?: string;
  driver_license_years_seniority?: string;
  driver_license_expiry_extracted?: string;
  vehicle_license_car_number?: string;
  vehicle_license_car_number_match?: string;
  vehicle_license_expiry_extracted?: string;
  license_analysis_results?: string;
  damage_amount?: number;
  depreciation_amount?: number;
  appraiser_fee?: number;
  repair_amount?: number;
  demand_letter_path?: string;
  marked_docs?: string[];
}

interface ClaimHandler {
  id: string | number;
  insurance_company: string;
  name: string;
  email: string;
  phone: string;
}

interface Entity {
  id: string | number;
  type: 'garage' | 'appraiser' | 'insurance';
  name: string;
  phone: string;
  email: string;
}

const STATUS_OPTIONS = [
  'ממתין לטיפול מבוטח',
  'עלינו לטפל',
  'ממתין להודעה / מס. תביעה בחברה',
  'ממתין לחומר מהמבוטח',
  'ממתין לדוח שמאי',
  'ממתין לכתב סילוקין',
  'ממתין לצק',
  'ממתין לאישור אי הגשה',
  'ממתין להעברה בנקאית',
  'ממתין לצ\'ק מצד ג\'',
  'בטיפול מוסך חיצוני',
  'הסתיים',
  'בוטל'
];

const SECONDARY_STATUS_OPTIONS = [
  'ממתין לצ\'ק מצד ג\'',
  'ממתין לטיפול מבוטח',
  'עלינו לטפל',
  'ממתין להודעה / מס. תביעה בחברה',
  'ממתין לחומר מהמבוטח',
  'ממתין לדוח שמאי',
  'ממתין לכתב סילוקין',
  'ממתין לצ\'ק מהחברה',
  'ממתין לאישור אי הגשה'
];

const CLAIM_TYPES = ['נזק עצמי', 'צד ג', 'צד ג - חיבוק', 'טוטל לוסט', 'טוטל לוסט - צד ג', 'גניבה'];

const APP_VERSION = "1.0.3 - 2026-03-07 12:35";

const DOC_LABELS: Record<string, string> = {
  claim_form_path: 'טופס הודעה',
  appraiser_report_path: 'דוח שמאי',
  appraiser_invoice_path: 'חשבונית שמאי',
  appraiser_photos_path: 'תמונות שמאי',
  garage_invoice_path: 'חשבונית תיקון מוסך',
  driver_license_path: 'רשיון נהיגה',
  driver_license_back_path: 'רשיון נהיגה חלק אחורי',
  vehicle_license_path: 'רשיון רכב',
  id_copy_path: 'צילום ת.ז',
  bank_confirmation_path: 'אישור ניהול חשבון',
  no_claims_path: 'אישור אי תביעות',
  consent_form_path: 'כתב ויתור סודיות',
  police_report_path: 'אישור משטרה',
  power_of_attorney_path: 'ייפוי כוח',
  no_submission_path: 'אישור אי הגשה',
  lien_confirmation_path: 'אישור הסרת שעבוד',
  accountant_confirmation_path: 'אישור רואה חשבון',
  policy_file_path: 'פוליסה',
  demand_letter_path: 'מכתב דרישה'
};

const JOTFORM_LINKS: Record<string, string> = {
  'איילון': 'https://form.jotform.com/232780982444060',
  'שומרה': 'https://form.jotform.com/232783244966467',
  'הראל': 'https://form.jotform.com/232784541483462',
  'שלמה': 'https://form.jotform.com/232785215879470',
  'חקלאי': 'https://form.jotform.com/232784907083464',
  'פניקס': 'https://form.jotform.com/232785448649473',
  'הכשרה': 'https://form.jotform.com/232784955516468',
  'מנורה': 'https://form.jotform.com/233192204698460',
};

function PublicClaimUpdates({ claimId }: { claimId: string }) {
  const [claimInfo, setClaimInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Get party from URL
  const urlParams = new URLSearchParams(window.location.search);
  const party = urlParams.get('party') as 'customer' | 'appraiser' | 'garage' | null;

  const fetchData = async () => {
    try {
      const infoRes = await fetch(`/api/public/claims/${claimId}/info`);

      if (!infoRes.ok) throw new Error('התביעה לא נמצאה או שאין גישה');

      const info = await infoRes.json();

      setClaimInfo(info);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [claimId]);

  const handlePublicUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingField(field);
    const isMultiple = ['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field);

    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file, file.name);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          return data.path;
        }
        console.error('Individual file upload failed:', file.name);
        return null;
      });

      const uploadedPaths = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedPaths.length === 0) throw new Error('העלאת הקבצים נכשלה');

      const docRes = await fetch(`/api/public/claims/${claimId}/documents?party=${party || ''}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, path: isMultiple ? uploadedPaths : uploadedPaths[0] })
      });
      
      if (!docRes.ok) throw new Error('שגיאה בעדכון המסמך במערכת');
      
      await fetchData(); // Refresh data
      alert('המסמכים הועלו בהצלחה!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err instanceof Error ? err.message : 'העלאת הקובץ נכשלה. נסה שוב.');
    } finally {
      setUploadingField(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">טוען עדכונים...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">שגיאה בטעינה</h2>
        <p className="text-slate-500 mb-6">{error}</p>
      </div>
    </div>
  );

  const requestedDocs = party === 'customer' ? claimInfo.requested_docs_customer :
                        party === 'appraiser' ? claimInfo.requested_docs_appraiser :
                        party === 'garage' ? claimInfo.requested_docs_garage :
                        claimInfo.requested_docs;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header - Only show if no specific party or if it's customer */}
        {(!party || party === 'customer') && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Car className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">עדכוני תביעה</h1>
                <p className="text-sm text-slate-500">צפייה בסטטוס ועדכונים שוטפים</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">שם לקוח</p>
                <p className="font-bold text-slate-900">{claimInfo.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">מספר פוליסה</p>
                <p className="font-bold text-slate-900">{claimInfo.policy_number || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">מספר רכב</p>
                <p className="font-bold text-slate-900 font-mono">{claimInfo.car_number}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">דגם</p>
                <p className="text-slate-700">{claimInfo.car_model}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">סטטוס נוכחי</p>
                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100">
                  {claimInfo.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {party === 'appraiser' ? 'העלאת מסמכי שמאי' : 
               party === 'garage' ? 'העלאת מסמכי מוסך' : 
               'מסמכי תביעה'}
            </h2>
          </div>
          
          <div className="space-y-3">
            {requestedDocs && requestedDocs.length > 0 ? (
              requestedDocs.map((field: string) => {
                const path = claimInfo[field];
                return (
                  <div key={field} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${path ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {path ? <Check size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{DOC_LABELS[field] || field}</p>
                          <p className="text-[10px] text-slate-500">{path ? 'המסמך התקבל' : 'חסר - נא להעלות'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className={`px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1 ${uploadingField === field ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload size={14} />
                          {uploadingField === field ? 'מעלה...' : (path ? 'הוסף קובץ' : 'העלאה')}
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple={['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field)}
                            disabled={uploadingField === field}
                            onChange={(e) => handlePublicUpload(e, field)} 
                            accept="image/*,application/pdf"
                          />
                        </label>
                      </div>
                    </div>

                    {path && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                        {(() => {
                          const paths = Array.isArray(path) ? path : [path];
                          return paths.map((p, idx) => (
                            <button 
                              key={idx}
                              onClick={() => window.open(p, '_blank')}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1"
                            >
                              <Search size={14} />
                              {paths.length > 1 ? `קובץ ${idx + 1}` : 'צפייה'}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500 py-4 text-sm italic">אין מסמכים נדרשים כרגע</p>
            )}
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} מערכת ניהול תביעות רכב - כל העדכונים מסופקים בזמן אמת
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('claims_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('claims_user');
        return null;
      }
    }
    return null;
  });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'policy' | 'submission'>('details');
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isEntityMgmtOpen, setIsEntityMgmtOpen] = useState(false);
  const [isAgentMgmtOpen, setIsAgentMgmtOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isHandlerMgmtOpen, setIsHandlerMgmtOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitEmail, setSubmitEmail] = useState('');
  const [submitAttachments, setSubmitAttachments] = useState<{path: string, name: string}[]>([]);
  const [submitBody, setSubmitBody] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [emailStep, setEmailStep] = useState<'ask' | 'edit'>('ask');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSearchingGarages, setIsSearchingGarages] = useState(false);
  const [garageSearchType, setGarageSearchType] = useState<'importer' | 'agreement'>('importer');
  const [garageSearchResults, setGarageSearchResults] = useState<any[]>([]);
  const [isGarageSearchModalOpen, setIsGarageSearchModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('05')) {
      // Mobile: 05X-XXXXXXX (10 digits total)
      if (digits.length <= 3) return digits;
      return `${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
    } else if (digits.length > 0) {
      // Landline: 0X-XXXXXXX (9 digits total usually)
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
    }
    return digits;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const [confirmModal, setConfirmModal] = useState<{ 
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText?: string,
    cancelText?: string,
    neutralText?: string,
    onNeutral?: () => void,
    onCancel?: () => void
  } | null>(null);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [claimLogs, setClaimLogs] = useState<ClaimLog[]>([]);
  const [newLogContent, setNewLogContent] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [claimHandlers, setClaimHandlers] = useState<ClaimHandler[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isHandlerModalOpen, setIsHandlerModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingHandler, setEditingHandler] = useState<ClaimHandler | null>(null);
  const [userFormData, setUserFormData] = useState({ username: '', password: '', role: 'user', email: '', phone: '' });
  const [entityFormData, setEntityFormData] = useState({ type: 'garage', name: '', phone: '', email: '' });
  const [agentFormData, setAgentFormData] = useState({ name: '', phone: '', email: '' });
  const [handlerFormData, setHandlerFormData] = useState({ insurance_company: '', name: '', email: '', phone: '' });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isDbChecking, setIsDbChecking] = useState(true);
  const [currentView, setCurrentView] = useState<'claims' | 'dashboard' | 'reports'>('claims');
  const [openDocListId, setOpenDocListId] = useState<string | number | null>(null);
  
  // Questionnaire state
  const [isQuestionnaireView, setIsQuestionnaireView] = useState(false);
  const [isPublicUpdatesView, setIsPublicUpdatesView] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [publicClaimId, setPublicClaimId] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [qData, setQData] = useState<any>(null);
  const [qClaim, setQClaim] = useState<any>(null);
  const [qStep, setQStep] = useState(1);
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);
  const [isFetchingQ, setIsFetchingQ] = useState(false);
  const [qError, setQError] = useState<string | null>(null);
  const [qFormData, setQFormData] = useState<any>({
    insured_name: '',
    insured_id: '',
    insured_phone: '',
    insured_email: '',
    car_number: '',
    car_model: '',
    event_date: '',
    event_time: '',
    event_location: '',
    event_description: '',
    damage_location: 'קדימה',
    has_third_party: false,
    tp_name: '',
    tp_phone: '',
    tp_car_number: '',
    tp_damage_location: 'קדימה'
  });

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/q/')) {
      const id = path.split('/q/')[1];
      setQuestionnaireId(id);
      setIsQuestionnaireView(true);
      fetchQuestionnaire(id);
    } else if (path.startsWith('/status/')) {
      const id = path.split('/status/')[1];
      setPublicClaimId(id);
      setIsPublicUpdatesView(true);
    }
    
    const savedUser = localStorage.getItem('claims_user');
    if (savedUser && !currentUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('claims_user');
      }
    }
    
    checkDbHealth();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenDocListId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const checkDbHealth = async () => {
    try {
      setIsDbChecking(true);
      const res = await fetch('/api/debug/db');
      const contentType = res.headers.get('content-type');
      if (!res.ok || (contentType && !contentType.includes('application/json'))) {
        setDbStatus({ status: 'error', message: 'השרת בתהליך אתחול...' });
        return;
      }
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      console.error("Failed to check DB health");
      setDbStatus({ status: 'error', message: 'לא ניתן להתחבר לשרת' });
    } finally {
      setIsDbChecking(false);
    }
  };

  const fetchQuestionnaire = async (id: string) => {
    try {
      setIsFetchingQ(true);
      const response = await fetch(`/api/questionnaires/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQData(data.questionnaire);
        setQClaim(data.claim);
        // Pre-fill some data from claim
        setQFormData(prev => ({
          ...prev,
          insured_name: data.claim.customer_name,
          insured_phone: data.claim.customer_phone,
          insured_email: data.claim.customer_email,
          car_number: data.claim.car_number,
          car_model: data.claim.car_model,
          event_date: data.claim.claim_date
        }));
      } else {
        setQError('השאלון לא נמצא או שכבר הושלם');
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      setQError('שגיאת תקשורת בטעינת השאלון');
    } finally {
      setIsFetchingQ(false);
    }
  };

  const submitQuestionnaire = async () => {
    console.log("Submitting questionnaire...", { questionnaireId, qFormData });
    if (!questionnaireId) {
      console.error("No questionnaire ID found");
      return;
    }
    setIsSubmittingQ(true);
    setQError(null);
    try {
      const response = await fetch(`/api/questionnaires/${questionnaireId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: qFormData }),
      });
      if (response.ok) {
        setQStep(4); // Success step
      } else {
        const err = await response.json();
        setQError(err.error || 'שגיאה בשמירת השאלון');
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      setQError('שגיאת תקשורת עם השרת');
    } finally {
      setIsSubmittingQ(false);
    }
  };

  const sendQuestionnaireLink = async (claim: Claim) => {
    try {
      const response = await fetch(`/api/claims/${claim.id}/questionnaire`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        const link = data.link;
        
        // Add to log
        await fetch(`/api/claims/${claim.id}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser?.username || 'System',
            content: `נוצר לינק לשאלון שומרה עבור הלקוח: ${link}`
          }),
        });
        
        fetchLogs(claim.id);
        showToast('לינק לשאלון נוצר ונוסף ליומן התביעה');
        
        // Copy to clipboard
        navigator.clipboard.writeText(link);
        
        // Ask if want to send via WhatsApp
        setConfirmModal({
          title: 'שאלון נוצר בהצלחה',
          message: 'הלינק הועתק ללוח. האם תרצה לשלוח אותו ללקוח בוואטסאפ?',
          confirmText: 'שלח בוואטסאפ',
          onConfirm: () => {
            setEditingClaim(claim);
            const msg = `שלום ${claim.customer_name}, מצורף לינק למילוי שאלון שומרה עבור רכב ${claim.car_number}:\n${link}\n\n`;
            setWhatsAppFormData({
              to: claim.customer_phone,
              message: msg
            });
            setIsWhatsAppModalOpen(true);
            setConfirmModal(null);
          }
        });
      }
    } catch (error) {
      console.error("Error creating questionnaire link:", error);
    }
  };
  const [emailFormData, setEmailFormData] = useState({ to: '', subject: '', body: '' });
  const [whatsAppFormData, setWhatsAppFormData] = useState({ to: '', message: '', additionalInfo: '' });

  const [formData, setFormData] = useState({
    claim_number: '',
    policy_number: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    car_number: '',
    car_model: '',
    claim_date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'חדש',
    claim_type: 'נזק עצמי',
    insurance_company: '',
    claim_handler: '',
    agent_name: '',
    agent_phone: '',
    garage_settlement: 'מוסך הסדר',
    garage_name: '',
    garage_phone: '',
    garage_email: '',
    appraiser_chosen: false,
    appraiser_name: '',
    appraiser_phone: '',
    appraiser_email: '',
    claim_form_path: '',
    appraiser_report_path: '',
    driver_license_path: '',
    driver_license_back_path: '',
    driver_license_status: 'טרם נבדק',
    driver_license_back_status: 'טרם נבדק',
    driver_license_years_seniority: '',
    driver_license_expiry_extracted: '',
    vehicle_license_path: '',
    vehicle_license_status: 'טרם נבדק',
    vehicle_license_car_number: '',
    vehicle_license_car_number_match: 'טרם נבדק',
    id_copy_path: '',
    bank_confirmation_path: '',
    no_claims_path: '',
    consent_form_path: '',
    police_report_path: '',
    power_of_attorney_path: '',
    no_submission_path: '',
    lien_confirmation_path: '',
    accountant_confirmation_path: '',
    has_lien: false,
    keys_handed_over: false,
    check_delivery_date: '',
    check_redemption_date: '',
    third_party_insurance_company: '',
    tp_agent_name: '',
    tp_agent_phone: '',
    tp_insured_name: '',
    tp_insured_phone: '',
    tp_car_number: '',
    follow_up_date: '',
    secondary_status: '',
    claim_value: 0,
    estimated_processing_days: '',
    public_notes: '',
    requested_docs: [] as string[],
    requested_docs_customer: [] as string[],
    requested_docs_appraiser: [] as string[],
    requested_docs_garage: [] as string[],
    appraiser_invoice_path: '',
    appraiser_photos_path: '',
    garage_invoice_path: '',
    damage_amount: 0,
    depreciation_amount: 0,
    appraiser_fee: 0,
    repair_amount: 0,
    demand_letter_path: '',
    customer_address: '',
    customer_id_number: '',
    policy_allowed_drivers: '',
    youngest_driver_age: '',
    named_drivers: '',
    youngest_driver_seniority: '',
    insurance_history: '',
    required_protection: '',
    additional_coverages: '',
    towing_services: '',
    replacement_car_service: '',
    glass_lights_service: '',
    deductible_cancellation: '',
    policy_file_path: '',
    driver_license_seniority_extracted: '',
    vehicle_license_expiry_extracted: '',
    license_analysis_results: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  };

  const analyzeDriverLicense = async (frontPath: string, backPath: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts: any[] = [];
      
      // Front side
      if (frontPath) {
        try {
          const frontRes = await fetch(frontPath);
          if (frontRes.ok) {
            const frontBlob = await frontRes.blob();
            const frontBase64 = await blobToBase64(frontBlob);
            parts.push({ inlineData: { mimeType: frontBlob.type, data: frontBase64 } });
          }
        } catch (e) {
          console.error('Error fetching front license:', e);
        }
      }
      
      // Back side if available
      if (backPath) {
        try {
          const backRes = await fetch(backPath);
          if (backRes.ok) {
            const backBlob = await backRes.blob();
            const backBase64 = await blobToBase64(backBlob);
            parts.push({ inlineData: { mimeType: backBlob.type, data: backBase64 } });
          }
        } catch (e) {
          console.error('Error fetching back license:', e);
        }
      }

      if (parts.length === 0) return;

      const prompt = `
        נתח את צילומי רשיון הנהיגה המצורפים. 
        התמונה הראשונה היא החלק הקדמי של הרשיון.
        התמונה השנייה (אם קיימת) היא החלק האחורי של הרשיון.

        הוצא את הפרטים הבאים:
        - seniority_year: שנת הוצאת הרשיון המקורית. חפש בחלק האחורי של הרשיון בלבד (התמונה השנייה)! 
          בגב הרשיון ישנה טבלה עם עמודות ממוספרות 9, 10, 11, 12.
          1. חפש בעמודה 9 את דרגה B (או סמל של מכונית פרטית).
          2. בשורה של דרגה B, הסתכל בעמודה 10 (העמודה הראשונה של התאריכים מימין לדרגה).
          3. חלץ את השנה (4 ספרות) מהתאריך המופיע בעמודה 10 בשורה B. זהו התאריך בו הוצא הרשיון לראשונה לדרגה זו.
          חשוב מאוד: אל תשתמש בשום תאריך מהחלק הקדמי של הרשיון (התמונה הראשונה) לצורך קביעת שנת הוצאת הרשיון המקורית. סעיף 4a הוא תאריך הדפסת הכרטיס בלבד ולא שנת הוצאת הרשיון.
          אם אין חלק אחורי או שלא ניתן למצוא את הטבלה, החזר null.
        - expiry_date: תאריך תוקף הרשיון (סעיף 4b בחלק הקדמי).
        - is_valid: האם הרשיון בתוקף (בדוק תאריך תוקף סעיף 4b לעומת התאריך היום: ${new Date().toLocaleDateString('he-IL')}). אם התאריך עבר, הוא לא בתוקף.
        - years_seniority: חשב כמה שנים עברו משנת הוצאת הרשיון (seniority_year) ועד היום (${new Date().getFullYear()}).
        החזר JSON בלבד.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }, ...parts] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(aiResponse.text);
      
      // Calculate seniority if not provided by AI but year is present
      let yearsSeniority = result.years_seniority;
      if (result.seniority_year && !yearsSeniority) {
        const yearMatch = result.seniority_year.toString().match(/\d{4}/);
        if (yearMatch) {
          yearsSeniority = (new Date().getFullYear() - parseInt(yearMatch[0])).toString();
        }
      }

      setFormData(prev => ({
        ...prev,
        driver_license_seniority_extracted: result.seniority_year || prev.driver_license_seniority_extracted,
        driver_license_years_seniority: yearsSeniority || prev.driver_license_years_seniority,
        driver_license_expiry_extracted: result.expiry_date || prev.driver_license_expiry_extracted,
        driver_license_status: result.is_valid ? 'בתוקף' : 'פג תוקף',
        driver_license_back_status: backPath ? (result.is_valid ? 'בתוקף' : 'פג תוקף') : prev.driver_license_back_status
      }));
    } catch (error) {
      console.error('Error analyzing driver license:', error);
    }
  };

  const analyzeVehicleLicense = async (filePath: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('Failed to fetch vehicle license');
      
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Vehicle license file is empty');
      
      const base64 = await blobToBase64(blob);

      const prompt = `
        נתח את צילום רשיון הרכב הזה והוצא את הפרטים הבאים:
        - expiry_date: תאריך תוקף הרשיון (תאריך המבחן השנתי הבא)
        - is_valid: האם הרשיון בתוקף נכון להיום (${new Date().toLocaleDateString('he-IL')}). אם תאריך המבחן השנתי הבא עבר, הוא לא בתוקף.
        - car_number: מספר רישוי (מספר הרכב)
        החזר JSON בלבד.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: blob.type || 'image/jpeg', data: base64 } }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(aiResponse.text);
      setFormData(prev => {
        const carNumberMatch = result.car_number && prev.car_number ? 
          (result.car_number.replace(/\D/g, '') === prev.car_number.replace(/\D/g, '') ? 'תואם' : 'לא תואם') : 
          'טרם נבדק';

        return {
          ...prev,
          vehicle_license_expiry_extracted: result.expiry_date || prev.vehicle_license_expiry_extracted,
          vehicle_license_status: result.is_valid ? 'בתוקף' : 'פג תוקף',
          vehicle_license_car_number: result.car_number || prev.vehicle_license_car_number,
          vehicle_license_car_number_match: carNumberMatch
        };
      });
    } catch (error) {
      console.error('Error analyzing vehicle license:', error);
    }
  };

  const analyzePolicy = async (filePath: string) => {
    if (!filePath) return;
    setIsAnalyzing(true);
    showToast('מנתח את הפוליסה, אנא המתן...', 'info');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('The uploaded file is empty.');
      }

      const base64 = await blobToBase64(blob);
      
      let mimeType = blob.type;
      // Ensure we have a valid mime type for Gemini
      if (!mimeType || mimeType === 'application/octet-stream') {
        const extension = filePath.split('?')[0].split('.').pop()?.toLowerCase();
        if (extension === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(extension || '')) mimeType = 'image/jpeg';
        else if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'webp') mimeType = 'image/webp';
      }

      const prompt = `
        נתח את מסמך פוליסת ביטוח הרכב המצורף.
        המסמך עשוי להיות של חברות שונות (כמו הראל, שומרה, 9 מיליון/איי.די.איי/IDI, מנורה, הפניקס, כלל, מגדל וכו').
        המסמך מכיל מספר עמודים. אנא סרוק את כל העמודים כדי למצוא את המידע הרלוונטי.
        הנתונים החשובים ביותר נמצאים בדרך כלל בעמוד שנקרא "מפרט" או "דף מפרט".
        
        אנא חלץ את הפרטים הבאים בדיוק רב בעברית:
        - customer_name: שם המבוטח (חפש תחת "שם המבוטח", "לכבוד", "בעלי פוליסה", "בעל פוליסה שם").
        - customer_address: כתובת המבוטח המלאה (חפש תחת "כתובת מגורים" או "כתובת").
        - customer_id_number: ת.ז. מבוטח (חפש תחת "ת.ז. מבוטח", "ת.ז.", או "ת.ז:").
        - policy_number: מספר פוליסה (חפש תחת "מס' הפוליסה", "מס' פוליסה", או "מספר פוליסה"). שים לב: מספר הפוליסה הוא בדרך כלל מספר ארוך (למשל 1770338901). אל תתבלבל עם מספר הרכב.
        - car_number: מספר רישוי/רכב (חפש תחת "מס' רישוי", "מספר רישוי", או "מספר רכב").
        - car_model: דגם הרכב ושנת הייצור (חפש תחת "יצרן" ו"דגם"). למשל: "סובארו פורסטר 2024".
        - insurance_company: שם חברת הביטוח (חפש לוגו או טקסט כמו "הראל", "שומרה", "9 מיליון", "איי.די.איי", "IDI", "מנורה").
        - policy_allowed_drivers: רשאים לנהוג לפי הפוליסה (חפש תחת "המורשים לנהוג", "רשאים לנהוג", "נהגים נקובים").
        - youngest_driver_age: גיל הנהג הצעיר ביותר המכוסה (בדוק בפרק הנהגים המורשים או תחת "תאריך לידה" של הנהגים).
        - named_drivers: שמות הנהגים הנקובים (חפש תחת "המורשים לנהוג" או "נהג נוסף").
        - youngest_driver_seniority: ותק הנהיגה הנדרש או הקיים (חפש תחת "וותק נהיגה" או "שנת הוצאת רישיון").
        - insurance_history: עבר ביטוחי מוצהר (היעדר תביעות).
        - required_protection: מיגון נדרש (חפש תחת "מיגון" או "דרישות מיגון").
        - additional_coverages: כיסויים נוספים (כמו הגנה משפטית, נזקי טבע וכו').
        - towing_services: שירותי גרירה ודרך ושם החברה (חפש "שירותי גרירה" או "שירותי דרך", למשל: שגריר, פמי, דרכים, מ.מ.ס.י).
        - replacement_car_service: רכב חלופי ושם נותן השירות (חפש "רכב חלופי" או "תחבורה חלופית").
        - glass_lights_service: כיסוי שמשות ופנסים ואת נותן השירות (למשל: אוטוגלס, אילן קארגלאס).
        - deductible_cancellation: ביטול השתתפות עצמית (חפש "ביטול השתתפות עצמית").

        החזר את התוצאה כאובייקט JSON בלבד. אם פרט מסוים לא נמצא, החזר מחרוזת ריקה.
        חשוב מאוד: אל תמציא נתונים. אם משהו לא מופיע בבירור, השאר ריק.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || 'application/pdf',
                  data: base64
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!aiResponse.text) {
        throw new Error('No response from AI model');
      }

      const result = JSON.parse(aiResponse.text);
      console.log('Policy analysis result:', result);
      
      // Sanitize result to avoid null values in controlled inputs
      const sanitizedResult: any = {};
      Object.keys(result).forEach(key => {
        sanitizedResult[key] = result[key] === null || result[key] === undefined ? '' : String(result[key]);
      });
      
      // Normalize insurance company name
      if (sanitizedResult.insurance_company) {
        const company = sanitizedResult.insurance_company;
        if (company.includes('איי.די.איי') || company.includes('IDI') || company.includes('9 מיליון')) {
          sanitizedResult.insurance_company = '9 מיליון';
        } else if (company.includes('הראל')) {
          sanitizedResult.insurance_company = 'הראל';
        } else if (company.includes('שומרה')) {
          sanitizedResult.insurance_company = 'שומרה';
        } else if (company.includes('מנורה')) {
          sanitizedResult.insurance_company = 'מנורה';
        } else if (company.includes('הפניקס')) {
          sanitizedResult.insurance_company = 'הפניקס';
        } else if (company.includes('כלל')) {
          sanitizedResult.insurance_company = 'כלל';
        } else if (company.includes('מגדל')) {
          sanitizedResult.insurance_company = 'מגדל';
        } else if (company.includes('איילון')) {
          sanitizedResult.insurance_company = 'איילון';
        } else if (company.includes('ביטוח ישיר')) {
          sanitizedResult.insurance_company = 'ביטוח ישיר';
        } else if (company.includes('AIG')) {
          sanitizedResult.insurance_company = 'AIG';
        } else if (company.includes('ליברה')) {
          sanitizedResult.insurance_company = 'ליברה';
        } else if (company.includes('וואישור') || company.includes('wesure')) {
          sanitizedResult.insurance_company = 'וואישור';
        } else if (company.includes('הכשרה')) {
          sanitizedResult.insurance_company = 'הכשרה';
        } else if (company.includes('שלמה')) {
          sanitizedResult.insurance_company = 'שלמה';
        }
      }
      
      setFormData(prev => ({
        ...prev,
        ...sanitizedResult,
        customer_name: sanitizedResult.customer_name || prev.customer_name,
        policy_number: sanitizedResult.policy_number || prev.policy_number,
        car_number: sanitizedResult.car_number || prev.car_number,
        insurance_company: sanitizedResult.insurance_company || prev.insurance_company,
        car_model: sanitizedResult.car_model || prev.car_model,
      }));

      // Also trigger license analysis if files are present
      if (formData.driver_license_path) {
        analyzeDriverLicense(formData.driver_license_path, formData.driver_license_back_path);
      }
      if (formData.vehicle_license_path) {
        analyzeVehicleLicense(formData.vehicle_license_path);
      }

      showToast('הפוליסה נותחה בהצלחה והנתונים עודכנו', 'success');
    } catch (error) {
      console.error('Error analyzing policy:', error);
      showToast(`שגיאה בניתוח הפוליסה: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePolicyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file, file.name);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      if (!response.ok) throw new Error('העלאת הקובץ נכשלה');
      const data = await response.json();
      if (data.path) {
        const newFormData = { ...formData, policy_file_path: data.path };
        setFormData(newFormData);
        analyzePolicy(data.path);

        if (editingClaim) {
          const saveRes = await fetch(`/api/claims/${editingClaim.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFormData),
          });
          if (saveRes.ok) {
            setInitialFormData(newFormData);
            await fetch(`/api/claims/${editingClaim.id}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: currentUser?.username || 'System',
                content: `הועלה מסמך: פוליסה`
              }),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error uploading policy:', error);
      showToast('שגיאה בהעלאת הפוליסה', 'error');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterInsurance, setFilterInsurance] = useState('all');
  const [filterEstimatedDays, setFilterEstimatedDays] = useState('all');
  const [sortBy, setSortBy] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'claim_date', direction: 'desc' });

  const getDaysSinceLastActivity = (claim: Claim) => {
    const lastActivity = claim.last_activity_at || claim.created_at;
    if (!lastActivity) return 0;
    const diff = new Date().getTime() - new Date(lastActivity).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getRemainingProcessingDays = (claim: Claim) => {
    if (!claim.estimated_processing_days || claim.estimated_processing_days === 'לא ידוע עדיין') {
      return 'לא ידוע';
    }
    const totalDays = parseInt(claim.estimated_processing_days.toString());
    const startDate = new Date(claim.claim_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = totalDays - diffDays;
    return remaining;
  };

  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEntitySelect = (type: 'garage' | 'appraiser', entityId: string | number) => {
    const entity = entities.find(e => e.id.toString() === entityId.toString());
    if (!entity) return;

    if (type === 'garage') {
      setFormData(prev => ({
        ...prev,
        garage_name: entity.name,
        garage_phone: entity.phone,
        garage_email: entity.email || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        appraiser_name: entity.name,
        appraiser_phone: entity.phone,
        appraiser_email: entity.email || '',
        appraiser_chosen: true
      }));
    }
  };

  const searchImporterGarages = async () => {
    if (!formData.car_model || !formData.insurance_company) {
      showToast('יש להזין דגם רכב וחברת ביטוח', 'error');
      return;
    }

    setGarageSearchType('importer');
    setIsSearchingGarages(true);
    setIsGarageSearchModalOpen(true);
    setGarageSearchResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const localGarages = entities.filter(e => e.type === 'garage').map(e => ({ name: e.name, phone: e.phone, email: e.email }));
      const prompt = `
        חפש מוסכי יבואן מורשים עבור רכב מסוג ${formData.car_model} שבהסדר עם חברת הביטוח ${formData.insurance_company}.
        
        להלן רשימת מוסכים קיימת במערכת, בדוק אם מישהו מהם מתאים והוא מוסך מורשה ליבואן של ${formData.car_model}:
        ${JSON.stringify(localGarages)}

        בנוסף, חפש מוסכים נוספים שמופיעים באתר חברת הביטוח: ${INSURANCE_GARAGE_URLS[formData.insurance_company] || ''}.
        עבור כל מוסך מצא:
        1. שם המוסך
        2. עיר/מיקום
        3. טלפון (אם זמין)
        4. האם הוא מוסך יבואן רשמי
        
        החזר רשימה בפורמט JSON:
        [
          { "name": "...", "location": "...", "phone": "...", "is_importer": true/false, "description": "..." }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json" 
        },
      });

      const results = JSON.parse(response.text);
      setGarageSearchResults(results);
    } catch (error) {
      console.error('Error searching garages:', error);
      showToast('שגיאה בחיפוש מוסכים', 'error');
    } finally {
      setIsSearchingGarages(false);
    }
  };

  const searchAgreementGarages = async (insuranceCompany?: string) => {
    const targetInsurance = insuranceCompany || formData.insurance_company;
    if (!targetInsurance) {
      showToast('יש לבחור חברת ביטוח', 'error');
      return;
    }

    setGarageSearchType('agreement');
    setIsSearchingGarages(true);
    setIsGarageSearchModalOpen(true);
    setGarageSearchResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        חפש את כל מוסכי ההסדר של חברת הביטוח ${targetInsurance}.
        ${formData.customer_address ? `אם הכתובת הבאה מכילה עיר, התמקד במוסכים באותה עיר: ${formData.customer_address}.` : ''}
        התמקד במוסכים שמופיעים באתר חברת הביטוח: ${INSURANCE_GARAGE_URLS[targetInsurance] || ''}.
        עבור כל מוסך מצא:
        1. שם המוסך
        2. עיר/מיקום
        3. טלפון (אם זמין)
        4. האם הוא מוסך יבואן רשמי (אם ידוע)
        
        החזר רשימה בפורמט JSON:
        [
          { "name": "...", "location": "...", "phone": "...", "is_importer": true/false, "description": "..." }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json" 
        },
      });

      const results = JSON.parse(response.text);
      setGarageSearchResults(results);
    } catch (error) {
      console.error('Error searching agreement garages:', error);
      showToast('שגיאה בחיפוש מוסכי הסדר', 'error');
    } finally {
      setIsSearchingGarages(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.car_number.includes(searchTerm);
    
    const matchesType = filterType === 'all' || claim.claim_type === filterType;
    const matchesInsurance = filterInsurance === 'all' || claim.insurance_company === filterInsurance;
    const matchesEstimated = filterEstimatedDays === 'all' || claim.estimated_processing_days === filterEstimatedDays;
    const matchesAgent = agentFilter === 'all' || claim.agent_id === agentFilter;
    
    // Archive logic: status === 'הסתיים' for archive, status !== 'הסתיים' for regular view
    const isClosed = claim.status === 'הסתיים';
    const matchesArchive = isArchiveView ? isClosed : !isClosed;
    
    return matchesSearch && matchesType && matchesInsurance && matchesEstimated && matchesAgent && matchesArchive;
  }).sort((a, b) => {
    // Priority 1: Claims with customer updates always at the top
    if (a.has_customer_updates && !b.has_customer_updates) return -1;
    if (!a.has_customer_updates && b.has_customer_updates) return 1;

    const field = sortBy.field as keyof Claim;
    
    if (field === 'claim_date' || field === 'follow_up_date') {
      const dateA = a[field] ? new Date(a[field] as string).getTime() : 0;
      const dateB = b[field] ? new Date(b[field] as string).getTime() : 0;
      return sortBy.direction === 'desc' ? dateB - dateA : dateA - dateB;
    }
    
    if (field === 'claim_value') {
      const valA = Number(a.claim_value) || 0;
      const valB = Number(b.claim_value) || 0;
      return sortBy.direction === 'desc' ? valB - valA : valA - valB;
    }

    if (field === 'estimated_processing_days') {
      const remA = getRemainingProcessingDays(a);
      const remB = getRemainingProcessingDays(b);
      const valA = remA === 'לא ידוע' ? Infinity : Number(remA);
      const valB = remB === 'לא ידוע' ? Infinity : Number(remB);
      return sortBy.direction === 'desc' ? valB - valA : valA - valB;
    }

    const valA = a[field] || '';
    const valB = b[field] || '';
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortBy.direction === 'desc' 
        ? valB.localeCompare(valA, 'he') 
        : valA.localeCompare(valB, 'he');
    }
    
    return 0;
  });

  useEffect(() => {
    if (currentUser) {
      fetchClaims();
      fetchEntities();
      fetchAgents();
      fetchClaimHandlers();
      if (currentUser.role === 'admin' || currentUser.role === 'מערכת') {
        fetchUsers();
      }
    }
  }, [currentUser]);

  useEffect(() => {
    let interval: any;
    if (currentUser) {
      interval = setInterval(() => {
        fetchClaims();
      }, 20000); // Poll every 20 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem('claims_user', JSON.stringify(user));
        showToast('התחברת בהצלחה');
      } else {
        const err = await response.json();
        setLoginError(err.error);
      }
    } catch (error) {
      setLoginError('שגיאת התחברות');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const isMultiple = ['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field);
    
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file, file.name);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        if (response.ok) {
          const data = await response.json();
          return data.path;
        }
        console.error('Individual file upload failed:', file.name);
        return null;
      });

      const uploadedPaths = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedPaths.length === 0) return;

      let newFormData: any;
      if (isMultiple) {
        const currentPaths = Array.isArray((formData as any)[field]) 
          ? (formData as any)[field] 
          : ((formData as any)[field] ? [(formData as any)[field]] : []);
        newFormData = { ...formData, [field]: [...currentPaths, ...uploadedPaths] };
      } else {
        newFormData = { ...formData, [field]: uploadedPaths[0] };
      }
      
      setFormData(newFormData);
      
      const updatedPath = uploadedPaths[0]; // For analysis and logging

      // Trigger analysis with the most up-to-date paths
      if (field === 'driver_license_path' || field === 'driver_license_back_path') {
        analyzeDriverLicense(newFormData.driver_license_path, newFormData.driver_license_back_path);
      }
      if (field === 'vehicle_license_path') {
        analyzeVehicleLicense(updatedPath);
      }
      if (field === 'policy_file_path') {
        analyzePolicy(updatedPath);
      }

      // If editing, update the claim in DB immediately and log it
      if (editingClaim) {
        // Update claim in DB
        const saveRes = await fetch(`/api/claims/${editingClaim.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFormData),
        });

        if (!saveRes.ok) {
          throw new Error('שגיאה בשמירת המסמך במערכת');
        }

        // Update initialFormData to match the new state since it's saved
        setInitialFormData(newFormData);

        // Add log
        await fetch(`/api/claims/${editingClaim.id}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser?.username || 'System',
            content: `הועלה מסמך: ${DOC_LABELS[field] || field}`
          }),
        });
        
        fetchClaims();
      }
      
      showToast('הקובץ הועלה בהצלחה');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showToast(error.message || 'שגיאה בהעלאת הקובץ', 'error');
    }
  };

  const handleDeleteFile = async (field: string, index?: number) => {
    if (!editingClaim) {
      if (typeof index === 'number' && Array.isArray((formData as any)[field])) {
        const newArr = [...(formData as any)[field]];
        newArr.splice(index, 1);
        setFormData({ ...formData, [field]: newArr.length > 0 ? newArr : '' });
      } else {
        setFormData({ ...formData, [field]: '' });
      }
      return;
    }

    setConfirmModal({
      title: 'מחיקת קובץ',
      message: 'האם אתה בטוח שברצונך למחוק קובץ זה?',
      onConfirm: async () => {
        try {
          let newFieldValue;
          if (typeof index === 'number' && Array.isArray((formData as any)[field])) {
            newFieldValue = [...(formData as any)[field]];
            newFieldValue.splice(index, 1);
            if (newFieldValue.length === 0) newFieldValue = '';
          } else {
            newFieldValue = '';
          }

          // Update local state
          const newFormData = { ...formData, [field]: newFieldValue };
          setFormData(newFormData);
          setInitialFormData(newFormData);

          // Update claim in DB
          await fetch(`/api/claims/${editingClaim.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFormData),
          });

          // Add log
          await fetch(`/api/claims/${editingClaim.id}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: currentUser?.username || 'System',
              content: `נמחק מסמך: ${DOC_LABELS[field] || field}`
            }),
          });
          
          fetchClaims();
          setConfirmModal(null);
          showToast('הקובץ נמחק בהצלחה');
        } catch (error) {
          console.error('Error deleting file:', error);
          showToast('שגיאה במחיקת הקובץ', 'error');
        }
      }
    });
  };

  const fetchClaims = async (retries = 3) => {
    try {
      const response = await fetch('/api/claims');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) {
          if (retries > 0) {
            console.log(`Server initializing, retrying fetchClaims... (${retries} left)`);
            setTimeout(() => fetchClaims(retries - 1), 2000);
            return;
          }
          throw new Error(`השרת עדיין בתהליך אתחול או שאינו זמין (סטטוס: ${response.status}). אנא נסה שוב בעוד מספר שניות.`);
        }
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } catch (e) {
          throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }
      
      if (contentType && !contentType.includes('application/json')) {
        if (retries > 0) {
          console.log(`Server returned HTML instead of JSON, retrying fetchClaims... (${retries} left)`);
          setTimeout(() => fetchClaims(retries - 1), 2000);
          return;
        }
        throw new Error(`השרת החזיר תגובה שאינה JSON (סוג: ${contentType}). ייתכן שהשרת בתהליך אתחול.`);
      }
      
      const data = await response.json();
      setClaims(data);
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      showToast(error.message || 'שגיאה בטעינת תביעות', 'error');
    }
  };

  const fetchUsers = async (retries = 3) => {
    try {
      const response = await fetch('/api/users');
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) {
          if (retries > 0) {
            console.log(`Server initializing, retrying fetchUsers... (${retries} left)`);
            setTimeout(() => fetchUsers(retries - 1), 2000);
            return;
          }
          throw new Error('השרת בתהליך אתחול...');
        }
        throw new Error(`Server error: ${response.status}`);
      }
      if (contentType && !contentType.includes('application/json')) {
        if (retries > 0) {
          console.log(`Server returned HTML instead of JSON, retrying fetchUsers... (${retries} left)`);
          setTimeout(() => fetchUsers(retries - 1), 2000);
          return;
        }
        throw new Error('תגובה לא תקינה מהשרת');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) throw new Error('השרת בתהליך אתחol...');
        throw new Error(`Server error: ${response.status}`);
      }
      if (contentType && !contentType.includes('application/json')) throw new Error('תגובה לא תקינה מהשרת');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleWhatsAppClick = (claim: Claim) => {
    setEditingClaim(claim);
    const statusLink = `${window.location.origin}/status/${claim.id}`;
    const message = `שלום ${claim.customer_name},
לגבי תביעה מספר ${claim.car_number} (${claim.car_model}):
סטטוס נוכחי: ${claim.status}
תאריך אירוע: ${formatDate(claim.claim_date)}
חברת ביטוח: ${claim.insurance_company}

לצפייה בכל העדכונים בתביעה:
${statusLink}
`;

    setWhatsAppFormData({
      to: claim.customer_phone,
      message: message,
      additionalInfo: ''
    });
    setIsWhatsAppModalOpen(true);
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim || !currentUser) return;

    // Format phone number for WhatsApp (972 prefix, no leading zero)
    let phone = whatsAppFormData.to.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '972' + phone.substring(1);
    } else if (!phone.startsWith('972') && phone.length === 9) {
      phone = '972' + phone;
    }

    const encodedMessage = encodeURIComponent(whatsAppFormData.message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    
    // Log the action
    try {
      await fetch(`/api/claims/${editingClaim.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          content: `נשלחה הודעת וואטסאפ למבוטח:\n${whatsAppFormData.message}`
        }),
      });
      fetchClaims();
      showToast('הודעת וואטסאפ נשלחה ותועדה ביומן');
    } catch (error) {
      console.error('Error logging WhatsApp action:', error);
    }
    
    setIsWhatsAppModalOpen(false);
    window.open(whatsappUrl, '_blank');
  };

  const getClaimDocuments = (claim: Claim) => {
    return [
      { name: 'טופס תביעה', path: claim.claim_form_path },
      { name: 'דוח שמאי', path: claim.appraiser_report_path },
      { name: 'רשיון נהיגה', path: claim.driver_license_path },
      { name: 'רשיון רכב', path: claim.vehicle_license_path },
      { name: 'צילום ת.ז', path: claim.id_copy_path },
      { name: 'אישור ניהול חשבון', path: claim.bank_confirmation_path },
      { name: 'אישור העדר תביעות', path: claim.no_claims_path },
      { name: 'טופס הסכמה', path: claim.consent_form_path },
      { name: 'אישור משטרה', path: claim.police_report_path },
      { name: 'ייפוי כוח', path: claim.power_of_attorney_path },
      { name: 'אישור אי הגשה', path: claim.no_submission_path },
      { name: 'אישור משעבד', path: claim.lien_confirmation_path },
      { name: 'אישור רואה חשבון', path: claim.accountant_confirmation_path },
    ].filter(doc => doc.path);
  };

  const followUpClaims = claims.filter(c => {
    if (!c.follow_up_date) return false;
    if (c.status === 'הסתיים' || c.status === 'בוטל') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(c.follow_up_date);
    followUpDate.setHours(0, 0, 0, 0);
    
    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 2;
  });

  const redemptionReminderClaims = claims.filter(c => {
    if (!c.check_redemption_date) return false;
    if (c.status === 'הסתיים' || c.status === 'בוטל') return false;
    
    const today = new Date();
    const redemptionDate = new Date(c.check_redemption_date);
    const diffTime = Math.abs(redemptionDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30;
  });

  const fetchEntities = async () => {
    try {
      const response = await fetch('/api/entities');
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) throw new Error('השרת בתהליך אתחול...');
        throw new Error(`Server error: ${response.status}`);
      }
      if (contentType && !contentType.includes('application/json')) throw new Error('תגובה לא תקינה מהשרת');
      const data = await response.json();
      setEntities(data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const fetchClaimHandlers = async () => {
    try {
      const response = await fetch('/api/claim-handlers');
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) throw new Error('השרת בתהליך אתחול...');
        throw new Error(`Server error: ${response.status}`);
      }
      if (contentType && !contentType.includes('application/json')) throw new Error('תגובה לא תקינה מהשרת');
      const data = await response.json();
      setClaimHandlers(data);
    } catch (error) {
      console.error('Error fetching claim handlers:', error);
    }
  };

  const [entityFilter, setEntityFilter] = useState<'all' | 'garage' | 'appraiser' | 'insurance'>('all');

  const filteredEntities = entities.filter(ent => entityFilter === 'all' || ent.type === entityFilter);

  const handleEntitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEntity ? `/api/entities/${editingEntity.id}` : '/api/entities';
      const method = editingEntity ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityFormData),
      });
      if (response.ok) {
        fetchEntities();
        setIsEntityModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving entity:', error);
    }
  };

  const handleHandlerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingHandler ? `/api/claim-handlers/${editingHandler.id}` : '/api/claim-handlers';
      const method = editingHandler ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handlerFormData),
      });
      if (response.ok) {
        fetchClaimHandlers();
        setIsHandlerModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving claim handler:', error);
    }
  };

  const handleDeleteEntity = async (id: string | number) => {
    setConfirmModal({
      title: 'מחיקת פריט',
      message: 'האם אתה בטוח שברצונך למחוק פריט זה?',
      onConfirm: async () => {
        await fetch(`/api/entities/${id}`, { method: 'DELETE' });
        fetchEntities();
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteHandler = async (id: string | number) => {
    setConfirmModal({
      title: 'מחיקת מסלק',
      message: 'האם אתה בטוח שברצונך למחוק מסלק זה?',
      onConfirm: async () => {
        await fetch(`/api/claim-handlers/${id}`, { method: 'DELETE' });
        fetchClaimHandlers();
        setConfirmModal(null);
      }
    });
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : '/api/agents';
      const method = editingAgent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentFormData),
      });

      if (response.ok) {
        fetchAgents();
        setIsAgentModalOpen(false);
        setEditingAgent(null);
        setAgentFormData({ name: '', phone: '', email: '' });
        showToast(editingAgent ? 'הסוכן עודכן בהצלחה' : 'הסוכן נוסף בהצלחה');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    setConfirmModal({
      title: 'מחיקת סוכן',
      message: 'האם אתה בטוח שברצונך למחוק סוכן זה?',
      onConfirm: async () => {
        try {
          await fetch(`/api/agents/${id}`, { method: 'DELETE' });
          fetchAgents();
          setConfirmModal(null);
          showToast('הסוכן נמחק בהצלחה');
        } catch (error) {
          console.error('Error deleting agent:', error);
        }
      }
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const handleSendEmail = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!editingClaim || !currentUser) {
      showToast('שגיאה: חסר מידע על התביעה או המשתמש', 'error');
      return;
    }

    if (!emailFormData.to || !emailFormData.to.includes('@')) {
      showToast('נא להזין כתובת מייל תקינה', 'error');
      return;
    }

    if (!emailFormData.subject) {
      showToast('נא להזין נושא למייל', 'error');
      return;
    }

    // Use selected attachments or default to all available if none selected?
    // User said: "including option to choose from uploaded documents and attach to email"
    const files = emailFormData.attachments.length > 0 ? emailFormData.attachments : [
      editingClaim.claim_form_path,
      editingClaim.appraiser_report_path,
      editingClaim.driver_license_path,
      editingClaim.vehicle_license_path,
      editingClaim.appraiser_invoice_path,
      editingClaim.appraiser_photos_path,
      editingClaim.garage_invoice_path,
      editingClaim.demand_letter_path
    ].filter(Boolean);

    setConfirmModal({
      title: 'אישור שליחה',
      message: `אני עומד לשלוח למייל שנבחר את הקבצים שסומנו (${files.length} קבצים), נא אישורך.`,
      confirmText: 'שלח',
      onConfirm: async () => {
        setConfirmModal(null);
        setIsSendingEmail(true);
        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...emailFormData,
              claimId: editingClaim.id,
              username: currentUser.username,
              attachments: files,
              attachmentNames: files.map(f => {
                const field = Object.keys(editingClaim).find(k => (editingClaim as any)[k] === f);
                return field ? DOC_LABELS[field] : 'מסמך';
              })
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsEmailModalOpen(false);
            fetchLogs(editingClaim.id);
            
            if (data.previewUrl) {
              showToast('המייל נשלח (מצב בדיקה). לחץ לצפייה במייל שנשלח', 'success');
              window.open(data.previewUrl, '_blank');
            } else {
              showToast('המייל נשלח בהצלחה');
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            showToast(`שגיאה בשליחת המייל: ${response.status} ${errorData.error || ''}`, 'error');
          }
        } catch (error) {
          console.error('Network error sending email:', error);
          showToast('שגיאת רשת בשליחת המייל. אנא בדוק את החיבור לאינטרנט.', 'error');
        } finally {
          setIsSendingEmail(false);
        }
      }
    });
  };

  const fetchLogs = async (claimId: string | number) => {
    try {
      const response = await fetch(`/api/claims/${claimId}/logs`);
      const data = await response.json();
      setClaimLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim || !newLogContent.trim() || !currentUser) return;
    try {
      const response = await fetch(`/api/claims/${editingClaim.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, content: newLogContent }),
      });
      if (response.ok) {
        setNewLogContent('');
        fetchLogs(editingClaim.id);
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting user form:', userFormData);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      console.log(`Request: ${method} ${url}`);
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        fetchUsers();
        setIsUserModalOpen(false);
        showToast(editingUser ? 'המשתמש עודכן בהצלחה' : 'המשתמש נוסף בהצלחה');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error saving user:', errorData);
        showToast(`שגיאה בשמירת המשתמש: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Network error saving user:', error);
      showToast('שגיאת רשת בשמירת המשתמש', 'error');
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    setConfirmModal({
      title: 'מחיקת משתמש',
      message: 'האם אתה בטוח שברצונך למחוק משתמש זה?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchUsers();
            setConfirmModal(null);
            showToast('המשתמש נמחק בהצלחה');
          } else {
            const errorData = await response.json().catch(() => ({}));
            showToast(`שגיאה במחיקת המשתמש: ${errorData.error || response.statusText}`, 'error');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          showToast('שגיאת רשת במחיקת המשתמש', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.customer_email && !isValidEmail(formData.customer_email)) {
      showToast('כתובת מייל לא תקינה', 'error');
      return;
    }

    try {
      const url = editingClaim ? `/api/claims/${editingClaim.id}` : '/api/claims';
      const method = editingClaim ? 'PUT' : 'POST';
      
      console.log(`Saving claim: ${method} ${url}`, formData);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchClaims();
        // Force close without dirty check
        setIsModalOpen(false);
        setEditingClaim(null);
        setInitialFormData(null);
        showToast(editingClaim ? 'התביעה עודכנה בהצלחה' : 'התביעה נשמרה בהצלחה');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error saving claim:', errorData);
        showToast(`שגיאה בשמירת התביעה: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error saving claim:', error);
      const message = error instanceof Error ? error.message : 'לא ידוע';
      showToast(`שגיאת רשת בשמירת התביעה: ${message}`, 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    setConfirmModal({
      title: 'מחיקת תביעה',
      message: 'האם אתה בטוח שברצונך למחוק תביעה זו?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/claims/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchClaims();
            setConfirmModal(null);
            showToast('התביעה נמחקה בהצלחה');
          }
        } catch (error) {
          console.error('Error deleting claim:', error);
          showToast('שגיאה במחיקת התביעה', 'error');
        }
      }
    });
  };

  const openModal = (claim: Claim | null = null) => {
    setModalTab('details');
    let initialData: any;
    if (claim) {
      if (claim.has_customer_updates) {
        showToast('מסמכים חדשים עודכנו במערכת על ידי הלקוח', 'success');
        fetch(`/api/claims/${claim.id}/clear-updates`, { method: 'POST' })
          .then(() => {
            setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, has_customer_updates: false } : c));
          })
          .catch(err => console.error("Failed to clear updates flag", err));
      }
      setEditingClaim(claim);
      initialData = {
        claim_number: claim.claim_number || '',
        policy_number: claim.policy_number || '',
        customer_name: claim.customer_name || '',
        customer_phone: claim.customer_phone || '',
        customer_email: claim.customer_email || '',
        car_number: claim.car_number || '',
        car_model: claim.car_model || '',
        claim_date: claim.claim_date || '',
        description: claim.description || '',
        status: claim.status || 'חדש',
        claim_type: claim.claim_type || 'נזק עצמי',
        insurance_company: claim.insurance_company || '',
        claim_handler: claim.claim_handler || '',
        garage_settlement: claim.garage_settlement || 'מוסך הסדר',
        garage_name: claim.garage_name || '',
        garage_phone: claim.garage_phone || '',
        garage_email: claim.garage_email || '',
        appraiser_chosen: !!claim.appraiser_chosen,
        appraiser_name: claim.appraiser_name || '',
        appraiser_phone: claim.appraiser_phone || '',
        appraiser_email: claim.appraiser_email || '',
        claim_form_path: claim.claim_form_path || '',
        appraiser_report_path: claim.appraiser_report_path || '',
        appraiser_invoice_path: claim.appraiser_invoice_path || '',
        appraiser_photos_path: claim.appraiser_photos_path || '',
        garage_invoice_path: claim.garage_invoice_path || '',
        driver_license_path: claim.driver_license_path || '',
        driver_license_back_path: claim.driver_license_back_path || '',
        driver_license_status: claim.driver_license_status || 'טרם נבדק',
        driver_license_back_status: claim.driver_license_back_status || 'טרם נבדק',
        driver_license_years_seniority: claim.driver_license_years_seniority || '',
        driver_license_expiry_extracted: claim.driver_license_expiry_extracted || '',
        vehicle_license_path: claim.vehicle_license_path || '',
        vehicle_license_status: claim.vehicle_license_status || 'טרם נבדק',
        vehicle_license_car_number: claim.vehicle_license_car_number || '',
        vehicle_license_car_number_match: claim.vehicle_license_car_number_match || 'טרם נבדק',
        id_copy_path: claim.id_copy_path || '',
        bank_confirmation_path: claim.bank_confirmation_path || '',
        no_claims_path: claim.no_claims_path || '',
        consent_form_path: claim.consent_form_path || '',
        police_report_path: claim.police_report_path || '',
        power_of_attorney_path: claim.power_of_attorney_path || '',
        no_submission_path: claim.no_submission_path || '',
        lien_confirmation_path: claim.lien_confirmation_path || '',
        accountant_confirmation_path: claim.accountant_confirmation_path || '',
        has_lien: !!claim.has_lien,
        keys_handed_over: !!claim.keys_handed_over,
        check_delivery_date: claim.check_delivery_date || '',
        check_redemption_date: claim.check_redemption_date || '',
        third_party_insurance_company: claim.third_party_insurance_company || '',
        tp_agent_name: claim.tp_agent_name || '',
        tp_agent_phone: claim.tp_agent_phone || '',
        agent_id: claim.agent_id || '',
        agent_name: claim.agent_name || '',
        agent_phone: claim.agent_phone || '',
        tp_insured_name: claim.tp_insured_name || '',
        tp_insured_phone: claim.tp_insured_phone || '',
        tp_car_number: claim.tp_car_number || '',
        follow_up_date: claim.follow_up_date || '',
        secondary_status: claim.secondary_status || '',
        claim_value: claim.claim_value || 0,
        estimated_processing_days: claim.estimated_processing_days || '',
        public_notes: claim.public_notes || '',
        requested_docs: claim.requested_docs || [],
        requested_docs_customer: claim.requested_docs_customer || [],
        requested_docs_appraiser: claim.requested_docs_appraiser || [],
        requested_docs_garage: claim.requested_docs_garage || [],
        customer_address: claim.customer_address || '',
        customer_id_number: claim.customer_id_number || '',
        policy_allowed_drivers: claim.policy_allowed_drivers || '',
        youngest_driver_age: claim.youngest_driver_age || '',
        named_drivers: claim.named_drivers || '',
        youngest_driver_seniority: claim.youngest_driver_seniority || '',
        insurance_history: claim.insurance_history || '',
        required_protection: claim.required_protection || '',
        additional_coverages: claim.additional_coverages || '',
        towing_services: claim.towing_services || '',
        replacement_car_service: claim.replacement_car_service || '',
        glass_lights_service: claim.glass_lights_service || '',
        deductible_cancellation: claim.deductible_cancellation || '',
        policy_file_path: claim.policy_file_path || '',
        driver_license_seniority_extracted: claim.driver_license_seniority_extracted || '',
        vehicle_license_expiry_extracted: claim.vehicle_license_expiry_extracted || '',
        license_analysis_results: claim.license_analysis_results || '',
        damage_amount: claim.damage_amount || 0,
        depreciation_amount: claim.depreciation_amount || 0,
        appraiser_fee: claim.appraiser_fee || 0,
        repair_amount: claim.repair_amount || 0,
        demand_letter_path: claim.demand_letter_path || '',
        marked_docs: claim.marked_docs || []
      };
    } else {
      setEditingClaim(null);
      initialData = {
        claim_number: '',
        policy_number: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        car_number: '',
        car_model: '',
        claim_date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'חדש',
        claim_type: 'נזק עצמי',
        insurance_company: '',
        claim_handler: '',
        agent_id: '',
        agent_name: '',
        agent_phone: '',
        garage_settlement: 'מוסך הסדר',
        garage_name: '',
        garage_phone: '',
        garage_email: '',
        appraiser_chosen: false,
        appraiser_name: '',
        appraiser_phone: '',
        appraiser_email: '',
        claim_form_path: '',
        appraiser_report_path: '',
        appraiser_invoice_path: '',
        appraiser_photos_path: '',
        garage_invoice_path: '',
        driver_license_path: '',
        driver_license_back_path: '',
        driver_license_status: 'טרם נבדק',
        driver_license_back_status: 'טרם נבדק',
        driver_license_years_seniority: '',
        driver_license_expiry_extracted: '',
        vehicle_license_path: '',
        vehicle_license_status: 'טרם נבדק',
        vehicle_license_car_number: '',
        vehicle_license_car_number_match: 'טרם נבדק',
        id_copy_path: '',
        bank_confirmation_path: '',
        no_claims_path: '',
        consent_form_path: '',
        police_report_path: '',
        power_of_attorney_path: '',
        no_submission_path: '',
        lien_confirmation_path: '',
        accountant_confirmation_path: '',
        has_lien: false,
        keys_handed_over: false,
        check_delivery_date: '',
        check_redemption_date: '',
        third_party_insurance_company: '',
        tp_agent_name: '',
        tp_agent_phone: '',
        tp_insured_name: '',
        tp_insured_phone: '',
        tp_car_number: '',
        follow_up_date: '',
        secondary_status: '',
        claim_value: 0,
        estimated_processing_days: '',
        public_notes: '',
        requested_docs: [],
        requested_docs_customer: [],
        requested_docs_appraiser: [],
        requested_docs_garage: [],
        customer_address: '',
        customer_id_number: '',
        policy_allowed_drivers: '',
        youngest_driver_age: '',
        named_drivers: '',
        youngest_driver_seniority: '',
        insurance_history: '',
        required_protection: '',
        additional_coverages: '',
        towing_services: '',
        replacement_car_service: '',
        glass_lights_service: '',
        deductible_cancellation: '',
        policy_file_path: '',
        driver_license_seniority_extracted: '',
        vehicle_license_expiry_extracted: '',
        license_analysis_results: '',
        damage_amount: 0,
        depreciation_amount: 0,
        appraiser_fee: 0,
        repair_amount: 0,
        demand_letter_path: '',
        marked_docs: []
      };
    }
    setInitialFormData(initialData);
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    if (isDirty) {
      setConfirmModal({
        title: 'שינויים שלא נשמרו',
        message: 'בוצע שינוי בטופס. האם ברצונך לעדכן את השינויים לפני היציאה?',
        confirmText: 'עדכן וסגור',
        neutralText: 'צא ללא עדכון',
        cancelText: 'חזור לעריכה',
        onConfirm: async () => {
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          await handleSubmit(fakeEvent);
          setConfirmModal(null);
        },
        onNeutral: () => {
          setIsModalOpen(false);
          setEditingClaim(null);
          setInitialFormData(null);
          setConfirmModal(null);
        },
        onCancel: () => {
          setConfirmModal(null);
        }
      });
    } else {
      setIsModalOpen(false);
      setEditingClaim(null);
      setInitialFormData(null);
    }
  };

  const sendDocumentRequests = (party: 'customer' | 'appraiser' | 'garage', type: 'whatsapp' | 'email') => {
    const CUSTOMER_DOCS = [
      'claim_form_path', 'policy_file_path', 'vehicle_license_path', 'driver_license_path', 
      'driver_license_back_path', 'id_copy_path', 'bank_confirmation_path', 'no_claims_path', 
      'police_report_path', 'consent_form_path', 'power_of_attorney_path', 'no_submission_path'
    ];
    const APPRAISER_DOCS = ['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path'];
    const GARAGE_DOCS = ['garage_invoice_path'];

    let docs: string[] = [];
    let phone = '';
    let email = '';
    let name = '';
    
    const allMarked = formData.marked_docs || [];

    if (party === 'customer') {
      docs = allMarked.filter(d => CUSTOMER_DOCS.includes(d));
      phone = formData.customer_phone || '';
      email = formData.customer_email || '';
      name = formData.customer_name;
      // Sync to requested_docs_customer for the public page
      setFormData(prev => ({ ...prev, requested_docs_customer: docs }));
    } else if (party === 'appraiser') {
      docs = allMarked.filter(d => APPRAISER_DOCS.includes(d));
      phone = formData.appraiser_phone || '';
      email = formData.appraiser_email || '';
      name = formData.appraiser_name;
      setFormData(prev => ({ ...prev, requested_docs_appraiser: docs }));
    } else if (party === 'garage') {
      docs = allMarked.filter(d => GARAGE_DOCS.includes(d));
      phone = formData.garage_phone || '';
      email = formData.garage_email || '';
      name = formData.garage_name;
      setFormData(prev => ({ ...prev, requested_docs_garage: docs }));
    }

    if (docs.length === 0) {
      showToast('לא נבחרו מסמכים לבקשה', 'error');
      return;
    }

    const isClaimFormMarked = docs.includes('claim_form_path');
    let jotFormLink = '';
    if (isClaimFormMarked && formData.insurance_company) {
      const company = Object.keys(JOTFORM_LINKS).find(name => formData.insurance_company.includes(name));
      if (company) {
        jotFormLink = JOTFORM_LINKS[company];
      }
    }

    const docList = docs.map(f => DOC_LABELS[f] || f).join(', ');
    const jotFormText = jotFormLink ? `\nניתן למלא טופס הודעה דיגיטלי כאן: ${jotFormLink}\n` : '';
    const publicUrl = `${window.location.origin}/status/${editingClaim?.id || ''}?party=${party}`;
    
    const message = `שלום ${name},

לצורך המשך טיפול בתביעה (רכב ${formData.car_number}), נשמח אם תעלה את המסמכים הבאים:
${docList}
${jotFormText}
ניתן להעלות את המסמכים בקישור הבא:
${publicUrl}

בברכה,
צוות התביעות`;

    if (type === 'whatsapp') {
      setWhatsAppFormData({
        to: phone,
        message: message,
        additionalInfo: ''
      });
      setIsWhatsAppModalOpen(true);
    } else {
      setEmailFormData({
        to: email,
        subject: `בקשת מסמכים - תביעת רכב ${formData.car_number}`,
        body: message.replace(/\n/g, '<br>'),
        attachments: []
      });
      setIsEmailModalOpen(true);
    }
  };

  const openCommunication = (type: 'email' | 'whatsapp', recipient: 'tp_insurance' | 'garage' | 'appraiser' | 'customer') => {
    let to = '';
    let email = '';
    let name = '';
    
    if (recipient === 'tp_insurance') {
      to = formData.tp_agent_phone || '';
      email = ''; // Need to find insurance email if possible
      name = formData.third_party_insurance_company || 'חברת ביטוח צד ג';
    } else if (recipient === 'garage') {
      to = formData.garage_phone || '';
      email = formData.garage_email || '';
      name = formData.garage_name;
    } else if (recipient === 'appraiser') {
      to = formData.appraiser_phone || '';
      email = formData.appraiser_email || '';
      name = formData.appraiser_name;
    } else if (recipient === 'customer') {
      to = formData.customer_phone || '';
      email = formData.customer_email || '';
      name = formData.customer_name;
    }

    if (type === 'email') {
      setEmailFormData({
        to: email,
        subject: `עדכון בנוגע לתביעה רכב ${formData.car_number}`,
        body: `שלום ${name},\n\nבהמשך לטיפול בתביעה מספר ${formData.claim_number || ''} עבור רכב ${formData.car_number}...\n\nבברכה,\nצוות התביעות`,
        attachments: []
      });
      setEmailStep('edit');
      setIsEmailModalOpen(true);
    } else {
      setWhatsAppFormData({
        to: to,
        message: `שלום ${name}, בהמשך לטיפול בתביעה רכב ${formData.car_number}...`,
        additionalInfo: ''
      });
      setIsWhatsAppModalOpen(true);
    }
  };

  const submitClaim = async () => {
    if (!editingClaim) return;
    
    try {
      showToast('מגיש תביעה...', 'info');
      const res = await fetch(`/api/claims/${editingClaim.id}/submit-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          body: submitBody,
          attachments: submitAttachments,
          to: submitEmail
        })
      });
      
      if (res.ok) {
        showToast('התביעה הוגשה בהצלחה', 'success');
        setIsSubmitModalOpen(false);
        setSubmitBody('');
        setSubmitEmail('');
        setSubmitAttachments([]);
        fetchClaims();
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        showToast(`שגיאה בהגשת תביעה: ${err.error}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      showToast('שגיאה בתקשורת עם השרת', 'error');
    }
  };

  const handleAddSubmitAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    showToast('מעלה קבצים...', 'info');
    const uploadPromises = Array.from(files).map(async (file: File) => {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file, file.name);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        return { path: data.path, name: file.name };
      }
      console.error('Individual attachment upload failed:', file.name);
      return null;
    });

    const uploadedResults = (await Promise.all(uploadPromises)).filter(Boolean) as {path: string, name: string}[];
    setSubmitAttachments(prev => [...prev, ...uploadedResults]);
    showToast('הקבצים נוספו בהצלחה', 'success');
  };

  const openLogs = (claim: Claim) => {
    setEditingClaim(claim);
    fetchLogs(claim.id);
    setIsLogsOpen(true);
  };

  const getFileExtension = (path: string) => {
    if (!path) return '';
    const parts = path.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'חדש': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'בטיפול': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ממתין לחלקים': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'הסתיים': return 'bg-green-100 text-green-800 border-green-200';
      case 'בוטל': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isQuestionnaireView) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans" dir="rtl">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">שאלון תביעה - שומרה</h1>
            <p className="opacity-80">נא למלא את כל הפרטים בצורה מדויקת</p>
          </div>

          <div className="p-8">
            {isFetchingQ ? (
              <div className="text-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">טוען נתונים...</p>
              </div>
            ) : qError && qStep !== 4 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">שגיאה</h2>
                <p className="text-slate-600 mb-6">{qError}</p>
              </div>
            ) : (
              <>
                {qStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  פרטי המבוטח והאירוע
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.insured_name}
                        onChange={e => setQFormData({...qFormData, insured_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">מספר פוליסה</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.policy_number || ''}
                        onChange={e => setQFormData({...qFormData, policy_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ת.ז</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.insured_id}
                        onChange={e => setQFormData({...qFormData, insured_id: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.insured_phone}
                        onChange={e => setQFormData({...qFormData, insured_phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">תאריך אירוע</label>
                      <input 
                        type="date" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.event_date}
                        onChange={e => setQFormData({...qFormData, event_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">שעה</label>
                      <input 
                        type="time" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={qFormData.event_time}
                        onChange={e => setQFormData({...qFormData, event_time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">מיקום האירוע</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.event_location || ''}
                      title={qFormData.event_location || ''}
                      onChange={e => setQFormData({...qFormData, event_location: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setQStep(2)}
                  className="w-full mt-8 bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  המשך לפרטי הנזק
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {qStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Car className="w-5 h-5 text-indigo-600" />
                  פרטי הנזק
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">תיאור האירוע</label>
                    <textarea 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                      value={qFormData.event_description || ''}
                      title={qFormData.event_description || ''}
                      onChange={e => setQFormData({...qFormData, event_description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">מיקום הפגיעה ברכב המבוטח</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.damage_location || 'קדימה'}
                      onChange={e => setQFormData({...qFormData, damage_location: e.target.value})}
                    >
                      <option>קדימה</option>
                      <option>קדימה ימין</option>
                      <option>ימין</option>
                      <option>ימין אחורי</option>
                      <option>אחורי</option>
                      <option>אחורי שמאל</option>
                      <option>שמאל</option>
                      <option>קדמי שמאל</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="has_tp"
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={qFormData.has_third_party}
                      onChange={e => setQFormData({...qFormData, has_third_party: e.target.checked})}
                    />
                    <label htmlFor="has_tp" className="text-sm font-medium text-indigo-900">האם מעורב צד ג'?</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => setQStep(1)}
                    className="bg-slate-100 text-slate-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                    חזרה
                  </button>
                  <button 
                    onClick={() => qFormData.has_third_party ? setQStep(3) : submitQuestionnaire()}
                    disabled={isSubmittingQ}
                    className="bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingQ ? 'שומר...' : (qFormData.has_third_party ? 'המשך לצד ג\'' : 'סיים ושמור')}
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                {qError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
                    {qError}
                  </div>
                )}
              </motion.div>
            )}

            {qStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  פרטי צד ג'
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">שם נהג צד ג'</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.tp_name || ''}
                      title={qFormData.tp_name || ''}
                      onChange={e => setQFormData({...qFormData, tp_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">טלפון צד ג'</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.tp_phone || ''}
                      title={qFormData.tp_phone || ''}
                      onChange={e => setQFormData({...qFormData, tp_phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">מספר רכב צד ג'</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.tp_car_number || ''}
                      title={qFormData.tp_car_number || ''}
                      onChange={e => setQFormData({...qFormData, tp_car_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">מיקום הפגיעה ברכב צד ג'</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={qFormData.tp_damage_location || 'קדימה'}
                      onChange={e => setQFormData({...qFormData, tp_damage_location: e.target.value})}
                    >
                      <option>קדימה</option>
                      <option>קדימה ימין</option>
                      <option>ימין</option>
                      <option>ימין אחורי</option>
                      <option>אחורי</option>
                      <option>אחורי שמאל</option>
                      <option>שמאל</option>
                      <option>קדמי שמאל</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => setQStep(2)}
                    className="bg-slate-100 text-slate-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                    חזרה
                  </button>
                  <button 
                    onClick={() => submitQuestionnaire()}
                    disabled={isSubmittingQ}
                    className="bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingQ ? 'שומר...' : 'סיים ושמור'}
                    <Check className="w-5 h-5" />
                  </button>
                </div>
                {qError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
                    {qError}
                  </div>
                )}
              </motion.div>
            )}

            {qStep === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">השאלון הושלם בהצלחה!</h2>
                <p className="text-slate-600">הפרטים הועברו למשרדנו להמשך טיפול. תודה רבה.</p>
              </motion.div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isPublicUpdatesView && publicClaimId) {
    return <PublicClaimUpdates claimId={publicClaimId} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              <Car className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">כניסה למערכת CRM</h1>
            <p className="text-slate-500 mt-2">אנא הזן שם משתמש וסיסמה</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">שם משתמש</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required
                  type="text" 
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">סיסמה</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required
                  type="password" 
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
              </div>
            </div>
            
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100"
              >
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              התחברות
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
      {dbStatus?.status === 'error' && (
        <div className="bg-red-600 text-white p-4 text-center font-bold flex items-center justify-center gap-4 sticky top-0 z-[100]">
          <AlertTriangle size={20} />
          <span>
            {dbStatus.configured 
              ? "שגיאה בחיבור ל-MongoDB. וודא שכתובת ה-Connection String ב-Secrets נכונה."
              : "משתנה הסביבה MONGODB_CONNECTION_STRING חסר. יש להגדיר אותו ב-Secrets."}
          </span>
          <button 
            onClick={checkDbHealth}
            className="bg-white text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Car className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">ניהול תביעות רכב</h1>
              <span className="text-[10px] text-slate-400 font-mono mt-1">{APP_VERSION}</span>
            </div>

            <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setCurrentView('claims')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'claims' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ClipboardList size={16} />
                <span>תביעות</span>
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={16} />
                <span>לוח בקרה</span>
              </button>
              <button 
                onClick={() => setCurrentView('reports')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 size={16} />
                <span>דוחות</span>
              </button>
            </nav>
            
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 border-r pr-6 border-slate-200">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>שלום, <span className="font-bold text-slate-900">{currentUser.username}</span></span>
              </div>
              {(currentUser.role === 'admin' || currentUser.role === 'מערכת') && (
                <button 
                  onClick={() => setIsUserMgmtOpen(true)}
                  className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
                >
                  <User size={14} /> ניהול משתמשים
                </button>
              )}
              <button 
                onClick={() => setIsEntityMgmtOpen(true)}
                className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
              >
                <Settings size={14} /> ניהול טבלאות
              </button>
              <button 
                onClick={() => setIsAgentMgmtOpen(true)}
                className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
              >
                <User size={14} /> ניהול סוכנים
              </button>
              <button onClick={() => {
                setCurrentUser(null);
                localStorage.removeItem('claims_user');
              }} className="text-red-500 hover:underline">התנתק</button>
            </div>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} />
            <span>תביעה חדשה</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Bar */}
        {(followUpClaims.length > 0 || redemptionReminderClaims.length > 0) && (
          <div className="mb-4 flex items-stretch gap-0 rounded-lg overflow-hidden border border-slate-200 h-14 shadow-sm">
            {followUpClaims.length > 0 && (
              <div className="flex-1 bg-amber-100 flex items-center px-4 gap-3 min-w-0 border-l border-amber-200">
                <Bell size={18} className="text-amber-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-amber-900 whitespace-nowrap">לטיפול היום ({followUpClaims.length})</span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar mt-1">
                    {followUpClaims.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => openModal(c)}
                        className="text-[10px] bg-white border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-50 transition-colors whitespace-nowrap font-bold text-amber-900"
                      >
                        {c.customer_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {redemptionReminderClaims.length > 0 && (
              <div className="flex-1 bg-red-100 flex items-center px-4 gap-3 min-w-0">
                <Clock size={18} className="text-red-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-red-900 whitespace-nowrap">פירעון צ'ק ({redemptionReminderClaims.length})</span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar mt-1">
                    {redemptionReminderClaims.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => openModal(c)}
                        className="text-[10px] bg-white border border-red-200 px-2 py-0.5 rounded hover:bg-red-50 transition-colors whitespace-nowrap font-bold text-red-900"
                      >
                        {c.customer_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search, Filter and Sort */}
        {currentView === 'claims' && (
          <div className="mb-8 space-y-4">
            {/* Agent Selection Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <User size={18} className="text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">סוכן להצגה:</span>
                <select 
                  className="bg-transparent text-sm text-slate-600 outline-none font-medium"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                >
                  <option value="all">כל הסוכנים</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative w-full lg:w-96 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="חפש לפי שם לקוח או מספר רכב..."
                    className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="תצוגת גריד"
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="תצוגת רשימה"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <Filter size={16} className="text-slate-400" />
                  <select 
                    className="bg-transparent text-sm text-slate-600 outline-none"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">כל סוגי התביעות</option>
                    {CLAIM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <Building2 size={16} className="text-slate-400" />
                  <select 
                    className="bg-transparent text-sm text-slate-600 outline-none"
                    value={filterInsurance}
                    onChange={(e) => setFilterInsurance(e.target.value)}
                  >
                    <option value="all">כל חברות הביטוח</option>
                    {entities.filter(e => e.type === 'insurance').map(e => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <Clock size={16} className="text-slate-400" />
                  <select 
                    className="bg-transparent text-sm text-slate-600 outline-none"
                    value={filterEstimatedDays}
                    onChange={(e) => setFilterEstimatedDays(e.target.value)}
                  >
                    <option value="all">כל זמני הטיפול</option>
                    <option value="30">30 יום</option>
                    <option value="45">45 יום</option>
                    <option value="60">60 יום</option>
                    <option value="90">90 יום</option>
                    <option value="לא ידוע עדיין">לא ידוע עדיין</option>
                  </select>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setIsArchiveView(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!isArchiveView ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    תביעות פתוחות
                  </button>
                  <button 
                    onClick={() => setIsArchiveView(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isArchiveView ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    ארכיון (הסתיים)
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <ArrowUpDown size={16} className="text-slate-400" />
                  <select 
                    className="bg-transparent text-sm text-slate-600 outline-none"
                    value={`${sortBy.field}_${sortBy.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('_');
                      setSortBy({ field, direction: direction as 'asc' | 'desc' });
                    }}
                  >
                    <option value="claim_date_desc">תאריך מקרה (חדש לישן)</option>
                    <option value="claim_date_asc">תאריך מקרה (ישן לחדש)</option>
                  <option value="estimated_processing_days_asc">זמן טיפול (מהקצר לארוך)</option>
                  <option value="estimated_processing_days_desc">זמן טיפול (מהארוך לקצר)</option>
                  <option value="customer_name_asc">שם מבוטח (א-ת)</option>
                  <option value="customer_name_desc">שם מבוטח (ת-א)</option>
                  <option value="claim_type_asc">סוג תביעה (א-ת)</option>
                  <option value="insurance_company_asc">חברת ביטוח (א-ת)</option>
                  <option value="status_asc">סטטוס (א-ת)</option>
                </select>
              </div>

              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm flex items-center">
                <span className="text-slate-500 ml-2">תוצאות:</span>
                <span className="font-bold text-slate-900">{filteredClaims.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Claims View */}
        {currentView === 'dashboard' ? (
          <Dashboard claims={claims} onViewClaim={(claim) => openModal(claim)} />
        ) : currentView === 'reports' ? (
          <Reports claims={claims} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredClaims.map((claim) => (
                <motion.div 
                  key={claim.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                >
                  <div className="p-5 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">
                      מס. תביעה: {claim.claim_number || '-'}
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                        {claim.claim_type && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-100 text-slate-600">
                            {claim.claim_type}
                          </span>
                        )}
                        {claim.has_customer_updates && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-red-200 bg-red-500 text-white animate-blink-red shadow-sm flex items-center gap-1 max-w-[200px]">
                            <Upload size={10} /> לקוח עדכן: {claim.customer_updated_docs?.map(f => DOC_LABELS[f] || f).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleWhatsAppClick(claim)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="שלח וואטסאפ"
                        >
                          <MessageCircle size={18} />
                        </button>
                        {claim.insurance_company === 'שומרה' && (
                          <button 
                            onClick={() => sendQuestionnaireLink(claim)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="שלח שאלון שומרה ללקוח"
                          >
                            <ExternalLink size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setEditingClaim(claim);
                            const formattedDate = formatDate(claim.claim_date);
                            setEmailFormData({
                              to: claim.customer_email || '',
                              subject: `שם מבוטח : ${claim.customer_name}  מס. רישוי : ${claim.car_number}  תאריך : ${formattedDate}`,
                              body: `שלום ${claim.customer_name},\n\nברצוננו לעדכן כי סטטוס התביעה שלך הוא: ${claim.status}.`
                            });
                            setEmailStep('edit');
                            setIsEmailModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="שלח מייל"
                        >
                          <Mail size={18} />
                        </button>
                        <button 
                          onClick={() => openLogs(claim)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="ציר זמן ועדכונים"
                        >
                          <Clock size={18} />
                        </button>
                        <button 
                          onClick={() => openModal(claim)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(claim.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <User size={18} className="text-slate-400" />
                      {claim.customer_name}
                    </h3>

                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-400" />
                        <span>{claim.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Car size={16} className="text-slate-400" />
                        <span>{claim.car_number} • {claim.car_model}</span>
                      </div>
                      {claim.policy_number && (
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-400" />
                          <span>פוליסה: {claim.policy_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span>תאריך: {formatDate(claim.claim_date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield size={16} className="text-slate-400" />
                        <span>{claim.insurance_company}</span>
                      </div>
                      {claim.follow_up_date && (
                        <div className={`flex items-center gap-3 font-bold ${(() => {
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const fuDate = new Date(claim.follow_up_date);
                          fuDate.setHours(0,0,0,0);
                          const diff = Math.floor((fuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          return diff <= 2 ? 'text-red-600' : 'text-amber-600';
                        })()}`}>
                          <Bell size={16} />
                          <span>טיפול הבא: {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const fuDate = new Date(claim.follow_up_date);
                            fuDate.setHours(0,0,0,0);
                            const diff = Math.floor((fuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            if (diff === 0) return 'היום';
                            if (diff === 1) return 'מחר';
                            if (diff < 0) return `לפני ${Math.abs(diff)} ימים`;
                            return `בעוד ${diff} ימים`;
                          })()} ({formatDate(claim.follow_up_date)})</span>
                        </div>
                      )}
                      {(claim.claim_form_path || claim.appraiser_report_path || claim.driver_license_path || claim.vehicle_license_path || claim.no_submission_path) && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                          {claim.claim_form_path && (
                            <a href={claim.claim_form_path} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-bold" title="טופס תביעה">
                              טופס תביעה
                            </a>
                          )}
                          {claim.appraiser_report_path && (
                            <a href={claim.appraiser_report_path} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-bold" title="דוח שמאי">
                              דוח שמאי
                            </a>
                          )}
                          {claim.driver_license_path && (
                            <a href={claim.driver_license_path} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-bold" title="רשיון נהיגה">
                              רשיון נהיגה
                            </a>
                          )}
                          {claim.vehicle_license_path && (
                            <a href={claim.vehicle_license_path} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-bold" title="רשיון רכב">
                              רשיון רכב
                            </a>
                          )}
                          {claim.no_submission_path && (
                            <a href={claim.no_submission_path} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors text-[10px] font-bold" title="אישור אי הגשה">
                              אישור אי הגשה
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      <span>לפני {getDaysSinceLastActivity(claim)} ימים</span>
                    </div>
                    {(claim.claim_form_path || claim.appraiser_report_path || claim.driver_license_path || claim.vehicle_license_path || claim.no_submission_path) && (
                      <div className="flex gap-1">
                        {claim.claim_form_path && (
                          <a href={claim.claim_form_path} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="טופס תביעה">
                            <FileText size={14} />
                          </a>
                        )}
                        {claim.appraiser_report_path && (
                          <a href={claim.appraiser_report_path} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="דוח שמאי">
                            <FileText size={14} />
                          </a>
                        )}
                        {claim.no_submission_path && (
                          <a href={claim.no_submission_path} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="אישור אי הגשה">
                            <FileText size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customer_name')}>
                      <div className="flex items-center gap-1">
                        מבוטח
                        {sortBy.field === 'customer_name' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('car_number')}>
                      <div className="flex items-center gap-1">
                        רכב
                        {sortBy.field === 'car_number' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('claim_type')}>
                      <div className="flex items-center gap-1">
                        סוג תביעה
                        {sortBy.field === 'claim_type' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('insurance_company')}>
                      <div className="flex items-center gap-1">
                        חברת ביטוח
                        {sortBy.field === 'insurance_company' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('third_party_insurance_company')}>
                      <div className="flex items-center gap-1">
                        צד ג'
                        {sortBy.field === 'third_party_insurance_company' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('claim_date')}>
                      <div className="flex items-center gap-1">
                        תאריך מקרה
                        {sortBy.field === 'claim_date' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('claim_value')}>
                      <div className="flex items-center gap-1">
                        סכום
                        {sortBy.field === 'claim_value' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        סטטוס
                        {sortBy.field === 'status' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700">מסמכים</th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700">טיפול אחרון</th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('follow_up_date')}>
                      <div className="flex items-center gap-1">
                        טיפול הבא
                        {sortBy.field === 'follow_up_date' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('estimated_processing_days')}>
                      <div className="flex items-center gap-1">
                        זמן טיפול משוער
                        {sortBy.field === 'estimated_processing_days' && (sortBy.direction === 'asc' ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />)}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-sm font-bold text-slate-700">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.map((claim) => {
                    const isDocsComplete = claim.requested_docs && claim.requested_docs.length > 0 && claim.requested_docs.every(field => !!(claim as any)[field]);
                    return (
                      <tr key={claim.id} onClick={() => openModal(claim)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-2 py-3 max-w-[150px]">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 shrink-0 items-center justify-center w-5">
                              <span 
                                className={`w-4 h-4 rounded-full ${isDocsComplete ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                                title={isDocsComplete ? 'כל המסמכים הנדרשים הועלו' : 'חסרים מסמכים נדרשים'}
                              ></span>
                              {claim.has_customer_updates ? (
                                <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" title="מסמכים חדשים מהלקוח"></span>
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-sm truncate" title={claim.customer_name}>{claim.customer_name}</div>
                              <div className="text-[10px] text-slate-500 truncate" title={claim.customer_phone}>{claim.customer_phone}</div>
                            </div>
                          </div>
                        </td>
                      <td className="px-2 py-3 max-w-[120px]">
                        <div className="text-sm text-slate-700 font-medium truncate" title={claim.car_number}>{claim.car_number}</div>
                        <div className="text-[10px] text-slate-500 truncate" title={claim.car_model}>{claim.car_model}</div>
                      </td>
                      <td className="px-2 py-3 text-xs text-slate-600 truncate max-w-[100px]" title={claim.claim_type}>{claim.claim_type}</td>
                      <td className="px-2 py-3 text-xs text-slate-600 truncate max-w-[120px]" title={claim.insurance_company}>{claim.insurance_company}</td>
                      <td className="px-2 py-3 text-xs text-slate-600 truncate max-w-[120px]" title={claim.third_party_insurance_company || ''}>{claim.third_party_insurance_company || '-'}</td>
                      <td className="px-2 py-3 text-xs text-slate-600">{formatDate(claim.claim_date)}</td>
                      <td className="px-2 py-3 text-xs text-slate-600 font-bold">₪{(claim.claim_value || 0).toLocaleString()}</td>
                      <td className="px-2 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDocListId(openDocListId === claim.id ? null : claim.id);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            getClaimDocuments(claim).length > 0 
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                              : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={getClaimDocuments(claim).length === 0}
                        >
                          <FileText size={14} />
                          <span>{getClaimDocuments(claim).length} מסמכים</span>
                        </button>
                        
                        <AnimatePresence>
                          {openDocListId === claim.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute z-50 right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 overflow-hidden"
                            >
                              {getClaimDocuments(claim).map((doc, idx) => (
                                <a 
                                  key={idx}
                                  href={doc.path} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 text-[11px] text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                >
                                  <FileText size={14} className="text-slate-400" />
                                  {doc.name}
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium text-slate-700">{getDaysSinceLastActivity(claim)} ימים</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        {claim.follow_up_date ? (
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold ${(() => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const fuDate = new Date(claim.follow_up_date);
                              fuDate.setHours(0,0,0,0);
                              const diff = Math.floor((fuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              return diff <= 2 ? 'text-red-600' : 'text-slate-700';
                            })()}`}>
                              {(() => {
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const fuDate = new Date(claim.follow_up_date);
                                fuDate.setHours(0,0,0,0);
                                const diff = Math.floor((fuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                if (diff === 0) return 'היום';
                                if (diff === 1) return 'מחר';
                                if (diff < 0) return `לפני ${Math.abs(diff)} ימים`;
                                return `בעוד ${diff} ימים`;
                              })()}
                            </span>
                            <span className="text-[9px] text-slate-500">{formatDate(claim.follow_up_date)}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold ${(() => {
                            const remaining = getRemainingProcessingDays(claim);
                            if (remaining === 'לא ידוע') return 'text-slate-400';
                            return Number(remaining) <= 5 ? 'text-red-600' : 'text-slate-700';
                          })()}`}>
                            {(() => {
                              const remaining = getRemainingProcessingDays(claim);
                              if (remaining === 'לא ידוע') return 'לא ידוע';
                              return `${remaining} ימים`;
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button onClick={() => handleWhatsAppClick(claim)} className="p-1 text-slate-400 hover:text-green-600 transition-colors" title="שלח וואטסאפ"><MessageCircle size={16} /></button>
                          {claim.insurance_company === 'שומרה' && (
                            <button onClick={() => sendQuestionnaireLink(claim)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="שלח שאלון שומרה"><ExternalLink size={16} /></button>
                          )}
                          <button 
                            onClick={() => {
                              setEditingClaim(claim);
                              const formattedDate = formatDate(claim.claim_date);
                              setEmailFormData({
                                to: claim.customer_email || '',
                                subject: `שם מבוטח : ${claim.customer_name}  מס. רישוי : ${claim.car_number}  תאריך : ${formattedDate}`,
                                body: `שלום ${claim.customer_name},\n\nברצוננו לעדכן כי סטטוס התביעה שלך הוא: ${claim.status}.`
                              });
                              setEmailStep('edit');
                              setIsEmailModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="שלח מייל"
                          >
                            <Mail size={16} />
                          </button>
                          <button onClick={() => openLogs(claim)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="ציר זמן"><Clock size={16} /></button>
                          <button onClick={() => openModal(claim)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="עריכה"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(claim.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="מחיקה"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredClaims.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">לא נמצאו תביעות</h3>
            <p className="text-slate-500">נסה לשנות את תנאי החיפוש או להוסיף תביעה חדשה</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[98vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">{editingClaim ? 'עדכון תביעה' : 'קליטת תביעה חדשה'}</h2>
                  {formData.policy_file_path && !isAnalyzing && (!formData.customer_name || !formData.policy_number || !formData.car_number) && (
                    <button
                      type="button"
                      onClick={() => analyzePolicy(formData.policy_file_path!)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95 animate-pulse"
                    >
                      <Shield size={14} />
                      בצע ניתוח פוליסה
                    </button>
                  )}
                </div>
                <button 
                  onClick={closeModal} 
                  disabled={isAnalyzing}
                  className={`text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 shrink-0">
                <button 
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setModalTab('details')}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''} ${modalTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid size={16} />
                  פרטי תביעה
                </button>
                <button 
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setModalTab('policy')}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''} ${modalTab === 'policy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Shield size={16} />
                  ניתוח פוליסות
                  {isAnalyzing && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>}
                </button>
                <button 
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setModalTab('submission')}
                  className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''} ${modalTab === 'submission' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Send size={16} />
                  הגשת תביעה ומסמכים
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                {modalTab === 'details' && (
                  <div className="flex flex-col gap-3">
                    {/* Section 1: Customer & Vehicle Info */}
                    <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 shadow-sm">
                      <div className="flex items-center gap-2 pb-2 border-b border-sky-200 mb-2">
                        <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg"><User size={18} /></div>
                        <h3 className="font-bold text-slate-800">פרטי לקוח ורכב</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">סוכן / מפעיל</label>
                          <select 
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-bold text-indigo-600" 
                            value={formData.agent_id || ''} 
                            onChange={(e) => {
                              const agent = agents.find(a => a.id === e.target.value);
                              setFormData({
                                ...formData, 
                                agent_id: e.target.value,
                                agent_name: agent?.name || '',
                                agent_phone: agent?.phone || ''
                              });
                            }}
                          >
                            <option value="">בחר סוכן...</option>
                            {agents.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">שם לקוח</label>
                          <input required type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" value={formData.customer_name || ''} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">טלפון נייד</label>
                          <input 
                            type="tel" 
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                            value={formData.customer_phone || ''} 
                            onChange={(e) => setFormData({...formData, customer_phone: formatPhoneNumber(e.target.value)})} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">מייל לקוח</label>
                          <input 
                            type="email" 
                            className={`w-full px-3 py-1.5 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${formData.customer_email && !isValidEmail(formData.customer_email) ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} 
                            value={formData.customer_email || ''} 
                            onChange={(e) => setFormData({...formData, customer_email: e.target.value})} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">חברת ביטוח</label>
                          <select 
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-bold" 
                            value={formData.insurance_company || ''} 
                            onChange={(e) => setFormData({...formData, insurance_company: e.target.value})}
                          >
                            <option value="">בחר חברה...</option>
                            {entities.filter(e => e.type === 'insurance').map(e => (
                              <option key={e.id} value={e.name}>{e.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">מספר פוליסה</label>
                          <input type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" value={formData.policy_number || ''} onChange={(e) => setFormData({...formData, policy_number: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">מספר רכב</label>
                          <input required type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono font-bold" value={formData.car_number || ''} onChange={(e) => setFormData({...formData, car_number: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">דגם רכב</label>
                          <input type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" value={formData.car_model || ''} onChange={(e) => setFormData({...formData, car_model: e.target.value})} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">מספר תביעה</label>
                          <input type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-bold text-indigo-600" value={formData.claim_number || ''} onChange={(e) => setFormData({...formData, claim_number: e.target.value})} />
                        </div>
                        
                        <div className="flex items-end pb-1.5">
                          <p className="text-[10px] text-slate-400 font-medium">תאריך פתיחה: {editingClaim ? new Date(editingClaim.created_at).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Incident & Status Info */}
                    {(() => {
                      const isTPClaim = formData.claim_type?.includes('צד ג');
                      const sectionBg = isTPClaim ? 'bg-yellow-50' : 'bg-sky-50';
                      const sectionBorder = isTPClaim ? 'border-yellow-100' : 'border-sky-100';
                      const headerBg = isTPClaim ? 'bg-yellow-100' : 'bg-sky-100';
                      const headerText = isTPClaim ? 'text-yellow-600' : 'text-sky-600';
                      const borderCol = isTPClaim ? 'border-yellow-200' : 'border-sky-200';

                      return (
                        <div className={`${sectionBg} p-4 rounded-2xl border-2 ${sectionBorder} shadow-sm`}>
                          <div className={`flex items-center gap-2 pb-2 border-b ${borderCol} mb-2`}>
                            <div className={`p-1.5 ${headerBg} ${headerText} rounded-lg`}><AlertCircle size={18} /></div>
                            <h3 className="font-bold text-slate-800">פרטי אירוע, מעקב תביעה</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">תאריך אירוע</label>
                              <input type="date" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.claim_date} onChange={(e) => setFormData({...formData, claim_date: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">סוג תביעה</label>
                              <select className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" value={formData.claim_type} onChange={(e) => setFormData({...formData, claim_type: e.target.value})}>
                                {CLAIM_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">סטטוס ראשי</label>
                              <select className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-bold" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">סטטוס משני</label>
                              <select className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" value={formData.secondary_status} onChange={(e) => setFormData({...formData, secondary_status: e.target.value})}>
                                <option value="">בחר סטטוס משני...</option>
                                {SECONDARY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">תאריך מעקב</label>
                              <input type="date" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.follow_up_date || ''} onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">זמן טיפול משוער</label>
                              <select 
                                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" 
                                value={formData.estimated_processing_days || ''} 
                                onChange={(e) => setFormData({...formData, estimated_processing_days: e.target.value})}
                              >
                                <option value="">בחר זמן טיפול...</option>
                                <option value="30">30 יום</option>
                                <option value="45">45 יום</option>
                                <option value="60">60 יום</option>
                                <option value="90">90 יום</option>
                                <option value="לא ידוע עדיין">לא ידוע עדיין</option>
                              </select>
                            </div>
                          </div>

                          {isTPClaim && (
                            <div className={`mt-3 p-3 ${isTPClaim ? 'bg-yellow-100/50 border-yellow-200' : 'bg-sky-100/50 border-sky-200'} rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-3`}>
                              <div className="space-y-1">
                                <label className={`text-[10px] font-bold ${isTPClaim ? 'text-yellow-700' : 'text-sky-700'} uppercase`}>חברת ביטוח צד ג'</label>
                                <select 
                                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl outline-none bg-white" 
                                  value={formData.third_party_insurance_company || ''} 
                                  onChange={(e) => setFormData({...formData, third_party_insurance_company: e.target.value})}
                                >
                                  <option value="">חברת ביטוח צד ג'...</option>
                                  {entities.filter(e => e.type === 'insurance').map(e => (
                                    <option key={e.id} value={e.name}>{e.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className={`text-[10px] font-bold ${isTPClaim ? 'text-yellow-700' : 'text-sky-700'} uppercase`}>סוכן צד ג'</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input placeholder="שם..." type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl outline-none bg-white" value={formData.tp_agent_name || ''} onChange={(e) => setFormData({...formData, tp_agent_name: e.target.value})} />
                                  <input placeholder="טלפון..." type="tel" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl outline-none bg-white" value={formData.tp_agent_phone || ''} onChange={(e) => setFormData({...formData, tp_agent_phone: formatPhoneNumber(e.target.value)})} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className={`text-[10px] font-bold ${isTPClaim ? 'text-yellow-700' : 'text-sky-700'} uppercase`}>מבוטח צד ג'</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input placeholder="שם..." type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl outline-none bg-white" value={formData.tp_insured_name || ''} onChange={(e) => setFormData({...formData, tp_insured_name: e.target.value})} />
                                  <input placeholder="מספר רכב..." type="text" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl outline-none font-mono bg-white" value={formData.tp_car_number || ''} onChange={(e) => setFormData({...formData, tp_car_number: e.target.value})} />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-500">סכום תביעה (₪)</label>
                              <input type="number" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={formData.claim_value || 0} onChange={(e) => setFormData({...formData, claim_value: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-1 md:col-span-2 lg:col-span-3">
                              <label className="text-xs font-medium text-slate-500">הערות לעדכון לקוח (יופיע בלינק הציבורי)</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                                value={formData.public_notes || ''} 
                                onChange={(e) => setFormData({...formData, public_notes: e.target.value})} 
                              />
                            </div>
                          </div>

                          {/* Section: Garage & Appraiser */}
                          <div className={`mt-4 pt-4 border-t ${borderCol}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Garage Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-amber-800">מוסך מטפל</h4>
                              <div className="flex gap-2">
                                {formData.insurance_company && INSURANCE_GARAGE_URLS[formData.insurance_company] && (
                                  <a 
                                    href={INSURANCE_GARAGE_URLS[formData.insurance_company]} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200 transition-all"
                                  >
                                    <ExternalLink size={10} /> מוסכי הסדר {formData.insurance_company}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={searchImporterGarages}
                                  className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-200 transition-all"
                                >
                                  <Search size={10} /> חיפוש מוסך מורשה {formData.car_model}
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <select 
                                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white"
                                onChange={(e) => {
                                  const garage = entities.find(ent => ent.name === e.target.value && ent.type === 'garage');
                                  if (garage) {
                                    setFormData({
                                      ...formData,
                                      garage_name: garage.name,
                                      garage_phone: garage.phone,
                                      garage_email: garage.email
                                    });
                                  }
                                }}
                                value={entities.some(e => e.name === formData.garage_name) ? formData.garage_name : ""}
                              >
                                <option value="">בחר מוסך מהרשימה...</option>
                                {entities.filter(ent => ent.type === 'garage').map(ent => (
                                  <option key={ent.id} value={ent.name}>{ent.name}</option>
                                ))}
                              </select>

                              <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="שם המוסך..."
                                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                  value={formData.garage_name}
                                  onChange={(e) => setFormData({...formData, garage_name: e.target.value})}
                                />
                                <button 
                                  type="button"
                                  onClick={() => setIsGarageSearchModalOpen(true)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-all"
                                  title="חיפוש מוסכי הסדר חכם"
                                >
                                  <Search size={16} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  placeholder="...טלפון"
                                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                  value={formData.garage_phone}
                                  onChange={(e) => setFormData({...formData, garage_phone: e.target.value})}
                                />
                                <input 
                                  type="email" 
                                  placeholder="מייל..."
                                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-left"
                                  value={formData.garage_email}
                                  onChange={(e) => setFormData({...formData, garage_email: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Appraiser Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-amber-800">שמאי</h4>
                            </div>

                            <div className="space-y-2">
                              <select 
                                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white"
                                onChange={(e) => {
                                  const appraiser = entities.find(ent => ent.name === e.target.value && ent.type === 'appraiser');
                                  if (appraiser) {
                                    setFormData({
                                      ...formData,
                                      appraiser_name: appraiser.name,
                                      appraiser_phone: appraiser.phone,
                                      appraiser_email: appraiser.email,
                                      appraiser_chosen: true
                                    });
                                  }
                                }}
                                value={entities.some(e => e.name === formData.appraiser_name) ? formData.appraiser_name : ""}
                              >
                                <option value="">בחר שמאי מהרשימה...</option>
                                {entities.filter(ent => ent.type === 'appraiser').map(ent => (
                                  <option key={ent.id} value={ent.name}>{ent.name}</option>
                                ))}
                              </select>

                              <input 
                                type="text" 
                                placeholder="שם השמאי..."
                                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                value={formData.appraiser_name}
                                onChange={(e) => setFormData({...formData, appraiser_name: e.target.value})}
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  placeholder="...טלפון"
                                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                  value={formData.appraiser_phone}
                                  onChange={(e) => setFormData({...formData, appraiser_phone: e.target.value})}
                                />
                                <input 
                                  type="email" 
                                  placeholder="מייל..."
                                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-left"
                                  value={formData.appraiser_email}
                                  onChange={(e) => setFormData({...formData, appraiser_email: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-amber-100">
                          <label className="text-xs font-bold text-slate-700 block mb-1">מסלק תביעות</label>
                          <input 
                            type="text" 
                            list="handlers-list"
                            placeholder="בחר או הקלד שם מסלק..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white/50" 
                            value={formData.claim_handler || ''} 
                            onChange={(e) => setFormData({...formData, claim_handler: e.target.value})} 
                          />
                          <datalist id="handlers-list">
                            {claimHandlers.map(h => (
                              <option key={h.id} value={h.name}>{h.insurance_company}</option>
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle size={16} className="text-yellow-600" />
                          <h4 className="text-sm font-bold text-slate-700">מרכז תקשורת</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { id: 'tp_insurance', label: "חב' ביטוח צד ג", icon: <Building2 size={14} /> },
                            { id: 'garage', label: 'מוסך', icon: <LayoutGrid size={14} /> },
                            { id: 'appraiser', label: 'שמאי', icon: <User size={14} /> },
                            { id: 'customer', label: 'לקוח', icon: <Phone size={14} /> }
                          ].map(item => (
                            <div key={item.id} className="bg-white/50 p-2 rounded-xl border border-yellow-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="text-yellow-600">{item.icon}</div>
                                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  type="button"
                                  onClick={() => openCommunication('email', item.id as any)}
                                  className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                                  title="שלח מייל"
                                >
                                  <Mail size={14} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => openCommunication('whatsapp', item.id as any)}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="שלח וואטסאפ"
                                >
                                  <MessageCircle size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

                {modalTab === 'submission' && (
                  <div className="flex flex-col gap-3">
                    {/* Section 3: Documents */}
                    <div className="space-y-4">
                      {/* Claim Submission Section */}
                      {(() => {
                        const allReqDocs = formData.marked_docs || [];
                        const isAllDocsPresent = allReqDocs.length > 0 && allReqDocs.every(field => {
                          const val = (formData as any)[field];
                          return Array.isArray(val) ? val.length > 0 : !!val;
                        });

                        if (!isAllDocsPresent) return null;

                        return (
                          <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100 shadow-md mb-6">
                            <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-200 mb-4">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Send size={20} /></div>
                                <h3 className="text-lg font-bold text-slate-800">הגשת תביעה</h3>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  const attachments: {path: string, name: string}[] = [];
                                  
                                  const getExt = (p: string) => {
                                    const parts = p.split('.');
                                    return parts.length > 1 ? `.${parts.pop()}` : '';
                                  };

                                  // Include all documents that have a path and are in DOC_LABELS
                                  Object.keys(DOC_LABELS).forEach(field => {
                                    const pathVal = (formData as any)[field];
                                    if (pathVal) {
                                      if (Array.isArray(pathVal)) {
                                        pathVal.forEach((p, i) => {
                                          attachments.push({
                                            path: p,
                                            name: `${DOC_LABELS[field] || field}${pathVal.length > 1 ? ` ${i + 1}` : ''}${getExt(p)}`
                                          });
                                        });
                                      } else {
                                        attachments.push({
                                          path: pathVal,
                                          name: `${DOC_LABELS[field] || field}${getExt(pathVal)}`
                                        });
                                      }
                                    }
                                  });
                                  
                                  setSubmitAttachments(attachments);
                                  
                                  // Find 3rd party insurance email
                                  const tpInsuranceName = editingClaim?.third_party_insurance_company;
                                  const tpEntity = entities.find(e => e.type === 'insurance' && e.name === tpInsuranceName);
                                  setSubmitEmail(tpEntity?.email || '');
                                  
                                  // Set default body
                                  setSubmitBody(`שלום רב ,
רצ"ב מסמכי התביעה לטיפולכם. 
בברכה 
עדי חסידים מסלקת תביעות .`);
                                  
                                  setIsSubmitModalOpen(true);
                                }}
                                disabled={!formData.demand_letter_path}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                                  formData.demand_letter_path 
                                    ? 'bg-purple-400 text-white hover:bg-purple-500' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <Mail size={18} />
                                הגש תביעה לחברת הביטוח
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                  <FileCheck size={16} className="text-green-500" />
                                  מסמכים נדרשים לתביעה:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {allReqDocs.map(field => (
                                    <div key={field} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100 text-sm">
                                      <CheckCircle2 size={14} className="text-green-500" />
                                      <span className="text-slate-600 truncate">{DOC_LABELS[field] || field}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-purple-100">
                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                  <FileText size={16} className="text-purple-500" />
                                  מכתב דרישה:
                                </h4>
                                {(() => {
                                  const field = 'demand_letter_path';
                                  const path = formData.demand_letter_path;
                                  return (
                                    <div className="relative group">
                                      <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e, field)}
                                        className="hidden"
                                        id={`upload-${field}`}
                                      />
                                      {!path ? (
                                        <label
                                          htmlFor={`upload-${field}`}
                                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
                                        >
                                          <Upload size={24} className="text-purple-400 mb-2" />
                                          <span className="text-sm font-medium text-purple-600">העלה מכתב דרישה</span>
                                        </label>
                                      ) : (
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm">
                                              <FileText size={20} />
                                            </div>
                                            <div>
                                              <p className="text-sm font-bold text-slate-700">מכתב דרישה</p>
                                              <p className="text-[10px] text-slate-500 uppercase">{getFileExtension(path)}</p>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <a
                                              href={path}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2 bg-white text-purple-600 rounded-lg hover:bg-purple-100 transition-all shadow-sm"
                                            >
                                              <Eye size={16} />
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteFile(field, path)}
                                              className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Customer Documents */}
                      <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 shadow-sm">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-green-200 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><User size={18} /></div>
                            <h3 className="font-bold text-slate-800">מסמכי לקוח</h3>
                          </div>
                          {editingClaim && (
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => sendDocumentRequests('customer', 'email')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-200 transition-all shadow-sm active:scale-95"
                              >
                                <Mail size={12} />
                                שלח בקשה במייל
                              </button>
                              <button 
                                type="button"
                                onClick={() => sendDocumentRequests('customer', 'whatsapp')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm active:scale-95"
                              >
                                <MessageCircle size={12} />
                                שלח בקשה לווסטאפ
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          {(() => {
    const renderUpload = (label: string, field: string, show: boolean = true) => {
      if (!show) return null;
      const paths = Array.isArray((formData as any)[field]) 
        ? (formData as any)[field] 
        : ((formData as any)[field] ? [(formData as any)[field]] : []);
      const hasFiles = paths.length > 0;
      const isMarked = formData.marked_docs?.includes(field);

      const toggleMarked = () => {
        const current = formData.marked_docs || [];
        if (isMarked) {
          setFormData({ ...formData, marked_docs: current.filter(f => f !== field) });
        } else {
          setFormData({ ...formData, marked_docs: [...current, field] });
        }
      };

      return (
        <div className={`group p-2.5 border rounded-xl transition-all ${isMarked ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-white/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <button 
                type="button"
                onClick={toggleMarked}
                className={`p-1.5 rounded-lg transition-all ${isMarked ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300 hover:text-slate-400'}`}
                title={isMarked ? 'הסר סימון כחובה' : 'סמן כמסמך חובה להגשה'}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-700 truncate leading-tight">{label}</p>
                {hasFiles ? (
                  <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    {paths.length} קבצים קיימים
                  </p>
                ) : (
                  isMarked && <p className="text-[9px] text-rose-500 font-bold">ממתין להעלאה</p>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <label className="cursor-pointer p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Upload size={14} />
                <input type="file" className="hidden" multiple={['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field)} onChange={(e) => handleFileUpload(e, field)} accept="image/*,application/pdf" />
              </label>
            </div>
          </div>
          
          {hasFiles && (
            <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
              {paths.map((path: string, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg group/file">
                  <div className="flex items-center gap-2 truncate cursor-pointer" onClick={() => window.open(path, '_blank')}>
                    <File size={12} className="text-indigo-500 shrink-0" />
                    <span className="text-[10px] text-slate-600 truncate">קובץ {idx + 1}</span>
                  </div>
                  <button type="button" onClick={() => handleDeleteFile(field, idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

                            const isTotalLossOrTheft = formData.claim_type === 'טוטל לוסט' || formData.claim_type === 'גניבה';

                            return (
                              <>
                                {renderUpload('טופס הודעה', 'claim_form_path')}
                                {renderUpload('פוליסה', 'policy_file_path')}
                                {renderUpload('רשיון רכב', 'vehicle_license_path')}
                                {renderUpload('רשיון נהיגה', 'driver_license_path')}
                                {renderUpload('רשיון נהיגה אחורי', 'driver_license_back_path')}
                                {renderUpload('צילום ת.ז', 'id_copy_path')}
                                {renderUpload('ניהול חשבון', 'bank_confirmation_path')}
                                {renderUpload('העדר תביעות', 'no_claims_path')}
                                {renderUpload('אישור משטרה', 'police_report_path')}
                                {isTotalLossOrTheft && renderUpload('טופס הסכמה', 'consent_form_path')}
                                {isTotalLossOrTheft && renderUpload('ייפוי כוח', 'power_of_attorney_path')}
                                {formData.claim_type === 'צד ג' && renderUpload('אישור אי הגשה', 'no_submission_path')}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Appraiser Documents */}
                      <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-blue-200 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Building2 size={18} /></div>
                            <h3 className="font-bold text-slate-800">מסמכי שמאי</h3>
                          </div>
                          <div className="flex gap-2">
                            {editingClaim && (
                              <>
                                <button 
                                  type="button"
                                  onClick={() => sendDocumentRequests('appraiser', 'email')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-200 transition-all shadow-sm active:scale-95"
                                >
                                  <Mail size={12} />
                                  שלח בקשה במייל
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => sendDocumentRequests('appraiser', 'whatsapp')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm active:scale-95"
                                >
                                  <MessageCircle size={12} />
                                  שלח בקשה לווסטאפ
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          {(() => {
                            const renderUpload = (label: string, field: string) => {
                              const paths = Array.isArray((formData as any)[field]) 
                                ? (formData as any)[field] 
                                : ((formData as any)[field] ? [(formData as any)[field]] : []);
                              const hasFiles = paths.length > 0;
                              const isMarked = formData.marked_docs?.includes(field);

                              const toggleMarked = () => {
                                const current = formData.marked_docs || [];
                                if (isMarked) {
                                  setFormData({ ...formData, marked_docs: current.filter(f => f !== field) });
                                } else {
                                  setFormData({ ...formData, marked_docs: [...current, field] });
                                }
                              };

                              return (
                                <div className={`group p-2.5 border rounded-xl transition-all ${isMarked ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-white/50'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      <button 
                                        type="button"
                                        onClick={toggleMarked}
                                        className={`p-1.5 rounded-lg transition-all ${isMarked ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300 hover:text-slate-400'}`}
                                        title={isMarked ? 'הסר סימון כחובה' : 'סמן כמסמך חובה להגשה'}
                                      >
                                        <Check size={14} strokeWidth={3} />
                                      </button>
                                      <div className="truncate">
                                        <p className="text-xs font-bold text-slate-700 truncate leading-tight">{label}</p>
                                        {hasFiles ? (
                                          <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle2 size={10} />
                                            {paths.length} קבצים קיימים
                                          </p>
                                        ) : (
                                          isMarked && <p className="text-[9px] text-rose-500 font-bold">ממתין להעלאה</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <label className="cursor-pointer p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Upload size={14} />
                                        <input type="file" className="hidden" multiple={['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field)} onChange={(e) => handleFileUpload(e, field)} accept="image/*,application/pdf" />
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {hasFiles && (
                                    <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
                                      {paths.map((path: string, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg group/file">
                                          <div className="flex items-center gap-2 truncate cursor-pointer" onClick={() => window.open(path, '_blank')}>
                                            <File size={12} className="text-indigo-500 shrink-0" />
                                            <span className="text-[10px] text-slate-600 truncate">קובץ {idx + 1}</span>
                                          </div>
                                          <button type="button" onClick={() => handleDeleteFile(field, idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <>
                                {renderUpload('דוח שמאי', 'appraiser_report_path')}
                                {renderUpload('חשבונית שמאי', 'appraiser_invoice_path')}
                                {renderUpload('תמונות שמאי', 'appraiser_photos_path')}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Garage Documents */}
                      <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 shadow-sm">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-orange-200 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><LayoutGrid size={18} /></div>
                            <h3 className="font-bold text-slate-800">מסמכי מוסך</h3>
                          </div>
                          {editingClaim && (
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                onClick={() => sendDocumentRequests('garage', 'email')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-200 transition-all shadow-sm active:scale-95"
                              >
                                <Mail size={12} />
                                שלח בקשה במייל
                              </button>
                              <button 
                                type="button"
                                onClick={() => sendDocumentRequests('garage', 'whatsapp')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm active:scale-95"
                              >
                                <MessageCircle size={12} />
                                שלח בקשה לווסטאפ
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                          {(() => {
                            const renderUpload = (label: string, field: string) => {
                              const paths = Array.isArray((formData as any)[field]) 
                                ? (formData as any)[field] 
                                : ((formData as any)[field] ? [(formData as any)[field]] : []);
                              const hasFiles = paths.length > 0;
                              const isMarked = formData.marked_docs?.includes(field);

                              const toggleMarked = () => {
                                const current = formData.marked_docs || [];
                                if (isMarked) {
                                  setFormData({ ...formData, marked_docs: current.filter(f => f !== field) });
                                } else {
                                  setFormData({ ...formData, marked_docs: [...current, field] });
                                }
                              };

                              return (
                                <div className={`group p-2.5 border rounded-xl transition-all ${isMarked ? 'border-indigo-300 bg-white shadow-sm' : 'border-slate-200 bg-white/50'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      <button 
                                        type="button"
                                        onClick={toggleMarked}
                                        className={`p-1.5 rounded-lg transition-all ${isMarked ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300 hover:text-slate-400'}`}
                                        title={isMarked ? 'הסר סימון כחובה' : 'סמן כמסמך חובה להגשה'}
                                      >
                                        <Check size={14} strokeWidth={3} />
                                      </button>
                                      <div className="truncate">
                                        <p className="text-xs font-bold text-slate-700 truncate leading-tight">{label}</p>
                                        {hasFiles ? (
                                          <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle2 size={10} />
                                            {paths.length} קבצים קיימים
                                          </p>
                                        ) : (
                                          isMarked && <p className="text-[9px] text-rose-500 font-bold">ממתין להעלאה</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <label className="cursor-pointer p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Upload size={14} />
                                        <input type="file" className="hidden" multiple={['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field)} onChange={(e) => handleFileUpload(e, field)} accept="image/*,application/pdf" />
                                      </label>
                                    </div>
                                  </div>
                                  
                                  {hasFiles && (
                                    <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
                                      {paths.map((path: string, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg group/file">
                                          <div className="flex items-center gap-2 truncate cursor-pointer" onClick={() => window.open(path, '_blank')}>
                                            <File size={12} className="text-indigo-500 shrink-0" />
                                            <span className="text-[10px] text-slate-600 truncate">קובץ {idx + 1}</span>
                                          </div>
                                          <button type="button" onClick={() => handleDeleteFile(field, idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <>
                                {renderUpload('חשבונית תיקון מוסך', 'garage_invoice_path')}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'policy' && (
                  /* Policy Details Tab */
                  <div className="space-y-6 bg-indigo-50/50 p-6 rounded-2xl border-2 border-indigo-100 shadow-sm min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Shield size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">ניתוח פוליסה רישיונות ומסמכים נוספים</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          id="policy-upload-tab" 
                          className="hidden" 
                          onChange={handlePolicyUpload} 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label 
                          htmlFor="policy-upload-tab" 
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md cursor-pointer active:scale-95"
                        >
                          <Upload size={16} />
                          העלאת פוליסה לניתוח
                        </label>
                        {isAnalyzing && (
                          <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold animate-pulse">
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            מנתח פוליסה...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6">
                      {/* License Status Section */}
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-indigo-100 mb-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700">רשיון נהיגה (קדמי)</label>
                            <div className="flex items-center gap-2">
                              {formData.driver_license_path && (
                                <button 
                                  type="button" 
                                  onClick={() => window.open(formData.driver_license_path, '_blank')}
                                  className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold hover:bg-indigo-200 transition-colors"
                                >
                                  הצג קובץ
                                </button>
                              )}
                              {formData.driver_license_path ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">קובץ קיים</span>
                              ) : (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">חסר קובץ</span>
                              )}
                            </div>
                          </div>
                          <select 
                            className={`w-full px-3 py-2 text-sm border rounded-xl outline-none transition-all ${formData.driver_license_status === 'בתוקף' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}
                            value={formData.driver_license_status || 'טרם נבדק'}
                            title={formData.driver_license_status || 'טרם נבדק'}
                            onChange={(e) => setFormData({...formData, driver_license_status: e.target.value})}
                          >
                            <option value="טרם נבדק">טרם נבדק</option>
                            <option value="בתוקף">בתוקף</option>
                            <option value="פג תוקף">פג תוקף</option>
                            <option value="לא תקין">לא תקין / לא קריא</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700">רשיון נהיגה (אחורי)</label>
                            <div className="flex items-center gap-2">
                              {formData.driver_license_back_path && (
                                <button 
                                  type="button" 
                                  onClick={() => window.open(formData.driver_license_back_path, '_blank')}
                                  className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold hover:bg-indigo-200 transition-colors"
                                >
                                  הצג קובץ
                                </button>
                              )}
                              {formData.driver_license_back_path ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">קובץ קיים</span>
                              ) : (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">חסר קובץ</span>
                              )}
                            </div>
                          </div>
                          <select 
                            className={`w-full px-3 py-2 text-sm border rounded-xl outline-none transition-all ${formData.driver_license_back_status === 'בתוקף' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}
                            value={formData.driver_license_back_status || 'טרם נבדק'}
                            title={formData.driver_license_back_status || 'טרם נבדק'}
                            onChange={(e) => setFormData({...formData, driver_license_back_status: e.target.value})}
                          >
                            <option value="טרם נבדק">טרם נבדק</option>
                            <option value="בתוקף">בתוקף</option>
                            <option value="פג תוקף">פג תוקף</option>
                            <option value="לא תקין">לא תקין / לא קריא</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700">מצב רשיון רכב</label>
                            <div className="flex items-center gap-2">
                              {formData.vehicle_license_path && (
                                <button 
                                  type="button" 
                                  onClick={() => window.open(formData.vehicle_license_path, '_blank')}
                                  className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold hover:bg-indigo-200 transition-colors"
                                >
                                  הצג קובץ
                                </button>
                              )}
                              {formData.vehicle_license_path ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">קובץ קיים</span>
                              ) : (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">חסר קובץ</span>
                              )}
                            </div>
                          </div>
                          <select 
                            className={`w-full px-3 py-2 text-sm border rounded-xl outline-none transition-all ${formData.vehicle_license_status === 'בתוקף' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}
                            value={formData.vehicle_license_status || 'טרם נבדק'}
                            title={formData.vehicle_license_status || 'טרם נבדק'}
                            onChange={(e) => setFormData({...formData, vehicle_license_status: e.target.value})}
                          >
                            <option value="טרם נבדק">טרם נבדק</option>
                            <option value="בתוקף">בתוקף</option>
                            <option value="פג תוקף">פג תוקף</option>
                            <option value="לא תקין">לא תקין / לא קריא</option>
                          </select>
                          {formData.vehicle_license_expiry_extracted && (
                            <p className="text-[10px] text-slate-500 font-bold truncate" title={`תוקף (חולץ): ${formData.vehicle_license_expiry_extracted}`}>תוקף (חולץ): {formData.vehicle_license_expiry_extracted}</p>
                          )}
                          {formData.vehicle_license_car_number && (
                            <div className="mt-1 flex items-center gap-2">
                              <p className="text-[10px] text-slate-500 font-bold truncate" title={`מספר רכב (חולץ): ${formData.vehicle_license_car_number}`}>מספר רכב (חולץ): {formData.vehicle_license_car_number}</p>
                              {formData.vehicle_license_car_number_match === 'תואם' ? (
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <Check size={10} /> תואם לפוליסה
                                </span>
                              ) : formData.vehicle_license_car_number_match === 'לא תואם' ? (
                                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <AlertCircle size={10} /> לא תואם לפוליסה
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-full flex flex-col gap-1">
                          {formData.driver_license_seniority_extracted && (
                            <p className="text-[10px] text-slate-500 font-bold">ותק נהיגה - שנת הוצאה (חולץ): {formData.driver_license_seniority_extracted} ({formData.driver_license_years_seniority} שנים)</p>
                          )}
                          {formData.driver_license_expiry_extracted && (
                            <p className="text-[10px] text-slate-500 font-bold">תוקף רשיון נהיגה (חולץ): {formData.driver_license_expiry_extracted}</p>
                          )}
                          {formData.vehicle_license_expiry_extracted && (
                            <p className="text-[10px] text-slate-500 font-bold">תוקף רשיון רכב (חולץ): {formData.vehicle_license_expiry_extracted}</p>
                          )}
                        </div>

                        {/* Analysis Results / Comparison */}
                        {(formData.youngest_driver_seniority || formData.driver_license_seniority_extracted || formData.vehicle_license_status) && (
                          <div className="col-span-full mt-2 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 shadow-sm">
                            <h4 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                              <AlertCircle size={16} />
                              סיכום ממצאי בדיקה והתאמה (רשיונות מול פוליסה):
                            </h4>
                            <div className="space-y-3">
                              {formData.youngest_driver_seniority && formData.driver_license_seniority_extracted && (
                                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">התאמת ותק נהיגה</span>
                                    <span className="text-[10px] text-slate-500">דרישת פוליסה: {formData.youngest_driver_seniority} שנים</span>
                                  </div>
                                  {(() => {
                                    const policySeniority = parseInt(formData.youngest_driver_seniority);
                                    const currentYear = new Date().getFullYear();
                                    const licenseYear = parseInt(formData.driver_license_seniority_extracted);
                                    const actualSeniority = currentYear - licenseYear;
                                    
                                    if (isNaN(policySeniority) || isNaN(licenseYear)) return <span className="text-slate-400 text-xs">לא ניתן לחישוב</span>;
                                    
                                    const isMatch = actualSeniority >= policySeniority;
                                    return (
                                      <div className="text-left">
                                        <span className={`text-sm font-bold ${isMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                                          {isMatch ? '✓ תואם לפוליסה' : `✗ אי התאמה`}
                                        </span>
                                        <p className="text-[10px] text-slate-400">ותק בפועל: {actualSeniority} שנים</p>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.driver_license_path && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                                    <span className="text-xs font-bold text-slate-700">תוקף רשיון נהיגה:</span>
                                    <span className={`text-xs font-bold ${formData.driver_license_status === 'בתוקף' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {formData.driver_license_status}
                                    </span>
                                  </div>
                                )}
                                {formData.vehicle_license_path && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-700">תוקף רשיון רכב:</span>
                                      {formData.vehicle_license_expiry_extracted && (
                                        <span className="text-[10px] text-slate-400">פג ב: {formData.vehicle_license_expiry_extracted}</span>
                                      )}
                                    </div>
                                    <span className={`text-xs font-bold ${formData.vehicle_license_status === 'בתוקף' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {formData.vehicle_license_status}
                                    </span>
                                  </div>
                                )}
                                {formData.vehicle_license_car_number && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-700">התאמת מספר רכב:</span>
                                      <span className="text-[10px] text-slate-400">מספר ברשיון: {formData.vehicle_license_car_number}</span>
                                    </div>
                                    <span className={`text-xs font-bold ${formData.vehicle_license_car_number_match === 'תואם' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {formData.vehicle_license_car_number_match}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-indigo-100">
                                {!formData.driver_license_path && <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={12} /> חסר צילום רשיון נהיגה (צד קדמי)</p>}
                                {formData.driver_license_path && !formData.driver_license_back_path && <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={12} /> חסר צילום גב רשיון הנהיגה (נדרש לאימות ותק)</p>}
                                {!formData.vehicle_license_path && <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={12} /> חסר צילום רשיון רכב לביצוע אימות תוקף</p>}
                                {!formData.youngest_driver_seniority && <p className="text-[10px] text-slate-400 italic">* לא הוזן ותק נדרש בנתוני הפוליסה</p>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {[
                        { label: 'כתובת מבוטח', field: 'customer_address' },
                        { label: 'ת.ז מבוטח', field: 'customer_id_number' },
                        { label: 'רשאים לנהוג', field: 'policy_allowed_drivers' },
                        { label: 'גיל נהג צעיר', field: 'youngest_driver_age' },
                        { label: 'שמות נהגים נקובים', field: 'named_drivers' },
                        { label: 'ותק נהג צעיר', field: 'youngest_driver_seniority' },
                        { label: 'עבר ביטוחי', field: 'insurance_history' },
                        { label: 'מיגון נדרש', field: 'required_protection' },
                        { label: 'כיסויים נוספים', field: 'additional_coverages' },
                        { label: 'גרירה ודרך', field: 'towing_services' },
                        { label: 'רכב חלופי', field: 'replacement_car_service' },
                        { label: 'שמשות ופנסים', field: 'glass_lights_service' },
                        { label: 'ביטול השתתפות', field: 'deductible_cancellation' }
                      ].map((item) => (
                        <div key={item.field} className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white" 
                            value={(formData as any)[item.field]} 
                            title={(formData as any)[item.field] || ''}
                            onChange={(e) => setFormData({...formData, [item.field]: e.target.value})} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button 
                      type="submit" 
                      disabled={isAnalyzing}
                      className={`px-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Save size={20} />
                      <span>{editingClaim ? 'עדכן שינויים' : 'שמור תביעה'}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={closeModal} 
                      disabled={isAnalyzing}
                      className={`px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ביטול
                    </button>
                  </div>
                  
                  {editingClaim && (
                    <div className="text-xs text-slate-400 font-medium">
                      נוצר ב: {new Date(editingClaim.created_at).toLocaleString('he-IL')}
                    </div>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logs Modal */}
      <AnimatePresence>
        {isLogsOpen && editingClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">תהליך טיפול בתביעה</h2>
                  <p className="text-sm text-slate-500">{editingClaim.customer_name} | {editingClaim.car_number}</p>
                </div>
                <button onClick={() => setIsLogsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 border-b border-slate-100 bg-white shrink-0">
                <form onSubmit={handleAddLog} className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">הוספת עדכון חדש</label>
                  <div className="flex gap-2">
                    <textarea 
                      required
                      placeholder="הקלד כאן את פרטי העדכון..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                      rows={2}
                      value={newLogContent}
                      onChange={(e) => setNewLogContent(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition-all active:scale-95 self-end h-12"
                    >
                      הוסף
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {claimLogs.length > 0 ? (
                  claimLogs.map((log) => (
                    <div key={log.id} className="relative pr-6 border-r-2 border-indigo-100 pb-2">
                      <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-indigo-600">{log.username}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString('he-IL')}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap" title={log.content}>{log.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 italic">אין עדכונים עדיין לתביעה זו</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entity Management Modal */}
      <AnimatePresence>
        {isEntityMgmtOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">ניהול טבלאות (מוסכים, שמאים, חברות ביטוח)</h2>
                <button onClick={() => setIsEntityMgmtOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-800">רשימת גופים</h3>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setEntityFilter('all')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${entityFilter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >הכל</button>
                      <button 
                        onClick={() => setEntityFilter('insurance')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${entityFilter === 'insurance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >חברות ביטוח</button>
                      <button 
                        onClick={() => setEntityFilter('appraiser')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${entityFilter === 'appraiser' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >שמאים</button>
                      <button 
                        onClick={() => setEntityFilter('garage')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${entityFilter === 'garage' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >מוסכים</button>
                      <button 
                        onClick={() => setEntityFilter('handler')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${entityFilter === 'handler' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >מסלקי תביעות</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (entityFilter === 'handler') {
                        setEditingHandler(null);
                        setHandlerFormData({ insurance_company: '', name: '', email: '', phone: '' });
                        setIsHandlerModalOpen(true);
                      } else {
                        setEditingEntity(null);
                        setEntityFormData({ type: entityFilter === 'all' ? 'garage' : entityFilter as any, name: '', phone: '', email: '' });
                        setIsEntityModalOpen(true);
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Plus size={16} /> הוסף {entityFilter === 'handler' ? 'מסלק' : 'גוף'} חדש
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">{entityFilter === 'handler' ? 'חברת ביטוח' : 'סוג'}</th>
                        <th className="px-4 py-3 font-medium">שם</th>
                        <th className="px-4 py-3 font-medium">טלפון</th>
                        <th className="px-4 py-3 font-medium">מייל</th>
                        <th className="px-4 py-3 font-medium">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entityFilter === 'handler' ? (
                        claimHandlers.map(handler => (
                          <tr key={handler.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[120px]" title={handler.insurance_company}>{handler.insurance_company}</td>
                            <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[150px]" title={handler.name}>{handler.name}</td>
                            <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]" title={handler.phone}>{handler.phone}</td>
                            <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]" title={handler.email}>{handler.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingHandler(handler);
                                    setHandlerFormData({ 
                                      insurance_company: handler.insurance_company, 
                                      name: handler.name, 
                                      email: handler.email, 
                                      phone: handler.phone 
                                    });
                                    setIsHandlerModalOpen(true);
                                  }}
                                  className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteHandler(handler.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        filteredEntities.map(ent => (
                          <tr key={ent.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ent.type === 'insurance' ? 'bg-blue-100 text-blue-700' : 
                                ent.type === 'appraiser' ? 'bg-green-100 text-green-700' : 
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {ent.type === 'insurance' ? 'חברת ביטוח' : ent.type === 'appraiser' ? 'שמאי' : 'מוסך'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[150px]" title={ent.name}>{ent.name}</td>
                            <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]" title={ent.phone}>{ent.phone}</td>
                            <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]" title={ent.email}>{ent.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingEntity(ent);
                                    setEntityFormData({ type: ent.type, name: ent.name, phone: ent.phone, email: ent.email });
                                    setIsEntityModalOpen(true);
                                  }}
                                  className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteEntity(ent.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Management Modal */}
      <AnimatePresence>
        {isUserMgmtOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">ניהול משתמשים והרשאות</h2>
                <button onClick={() => setIsUserMgmtOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">רשימת משתמשים</h3>
                  <button 
                    onClick={() => {
                      setEditingUser(null);
                      setUserFormData({ username: '', password: '', role: 'user', email: '', phone: '' });
                      setIsUserModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Plus size={16} /> הוסף משתמש
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">שם משתמש</th>
                        <th className="px-4 py-3 font-medium">סיסמה</th>
                        <th className="px-4 py-3 font-medium">מייל</th>
                        <th className="px-4 py-3 font-medium">נייד</th>
                        <th className="px-4 py-3 font-medium">תפקיד</th>
                        <th className="px-4 py-3 font-medium">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-900 font-medium">{user.username}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{user.password}</td>
                          <td className="px-4 py-3 text-slate-500 text-sm">{user.email || '-'}</td>
                          <td className="px-4 py-3 text-slate-500 text-sm">{user.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'admin' || user.role === 'מערכת' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                              {user.role === 'admin' || user.role === 'מערכת' ? 'מנהל מערכת' : 'משתמש רגיל'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingUser(user);
                                  setUserFormData({ 
                                    username: user.username, 
                                    password: user.password, 
                                    role: user.role,
                                    email: user.email || '',
                                    phone: user.phone || ''
                                  });
                                  setIsUserModalOpen(true);
                                }}
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
                              >
                                <Edit2 size={14} />
                              </button>
                              {user.username !== 'admin' && (
                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agent Management Modal */}
      <AnimatePresence>
        {isAgentMgmtOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAgentMgmtOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <User className="text-indigo-600" size={24} />
                  <h2 className="text-xl font-bold text-slate-900">ניהול סוכנים / מפעילים</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setEditingAgent(null);
                      setAgentFormData({ name: '', phone: '', email: '' });
                      setIsAgentModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Plus size={18} /> הוסף סוכן
                  </button>
                  <button onClick={() => setIsAgentMgmtOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-right" dir="rtl">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-medium">שם סוכן</th>
                        <th className="px-4 py-3 font-medium">טלפון</th>
                        <th className="px-4 py-3 font-medium">מייל</th>
                        <th className="px-4 py-3 font-medium">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agents.map(agent => (
                        <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-900 font-bold">{agent.name}</td>
                          <td className="px-4 py-3 text-slate-500 text-sm">{agent.phone || '-'}</td>
                          <td className="px-4 py-3 text-slate-500 text-sm">{agent.email || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingAgent(agent);
                                  setAgentFormData({ 
                                    name: agent.name, 
                                    phone: agent.phone || '', 
                                    email: agent.email || '' 
                                  });
                                  setIsAgentModalOpen(true);
                                }}
                                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteAgent(agent.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agent Add/Edit Modal */}
      <AnimatePresence>
        {isAgentModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAgentModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">{editingAgent ? 'עדכון סוכן' : 'הוספת סוכן חדש'}</h2>
                <button onClick={() => setIsAgentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAgentSubmit} className="p-6 space-y-4 text-right" dir="rtl">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">שם הסוכן</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={agentFormData.name} onChange={(e) => setAgentFormData({...agentFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">טלפון</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={agentFormData.phone} onChange={(e) => setAgentFormData({...agentFormData, phone: formatPhoneNumber(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">מייל</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={agentFormData.email} onChange={(e) => setAgentFormData({...agentFormData, email: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">שמור</button>
                  <button type="button" onClick={() => setIsAgentModalOpen(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all">ביטול</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Handler Modal */}
      <AnimatePresence>
        {isHandlerModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHandlerModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">{editingHandler ? 'עדכון מסלק' : 'הוספת מסלק חדש'}</h2>
                <button onClick={() => setIsHandlerModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleHandlerSubmit} className="p-6 space-y-4 text-right" dir="rtl">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">חברת ביטוח</label>
                  <select 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white" 
                    value={handlerFormData.insurance_company} 
                    onChange={(e) => setHandlerFormData({...handlerFormData, insurance_company: e.target.value})}
                  >
                    <option value="">בחר חברת ביטוח...</option>
                    {entities.filter(e => e.type === 'insurance').map(e => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">שם המסלק</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={handlerFormData.name} onChange={(e) => setHandlerFormData({...handlerFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">מייל</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={handlerFormData.email} onChange={(e) => setHandlerFormData({...handlerFormData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 block">טלפון</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={handlerFormData.phone} onChange={(e) => setHandlerFormData({...handlerFormData, phone: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all">שמור</button>
                  <button type="button" onClick={() => setIsHandlerModalOpen(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all">ביטול</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entity Add/Edit Modal */}
      <AnimatePresence>
        {isEntityModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEntityModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold mb-6">{editingEntity ? 'עדכון גוף' : 'הוספת גוף חדש'}</h3>
              <form onSubmit={handleEntitySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">סוג</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white" value={entityFormData.type} onChange={e => setEntityFormData({...entityFormData, type: e.target.value as any})}>
                    <option value="garage">מוסך</option>
                    <option value="appraiser">שמאי</option>
                    <option value="insurance">חברת ביטוח</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">שם</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={entityFormData.name} onChange={e => setEntityFormData({...entityFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">טלפון</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={entityFormData.phone} onChange={e => setEntityFormData({...entityFormData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">מייל</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={entityFormData.email} onChange={e => setEntityFormData({...entityFormData, email: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">שמור</button>
                  <button type="button" onClick={() => setIsEntityModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl">ביטול</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Garage Search Modal */}
      <AnimatePresence>
        {isGarageSearchModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGarageSearchModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${garageSearchType === 'importer' ? 'bg-emerald-50' : 'bg-indigo-50'} shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 ${garageSearchType === 'importer' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'} rounded-lg`}>
                    {garageSearchType === 'importer' ? <Search size={18} /> : <LayoutGrid size={18} />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {garageSearchType === 'importer' ? 'איתור מוסכי יבואן' : 'רשימת מוסכי הסדר'} - {formData.insurance_company}
                  </h2>
                </div>
                <button onClick={() => setIsGarageSearchModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isSearchingGarages ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className={`w-12 h-12 border-4 ${garageSearchType === 'importer' ? 'border-emerald-100 border-t-emerald-600' : 'border-indigo-100 border-t-indigo-600'} rounded-full animate-spin`} />
                    <p className="text-slate-500 font-medium animate-pulse">
                      {garageSearchType === 'importer' 
                        ? `מחפש מוסכי יבואן עבור ${formData.car_model}...` 
                        : `טוען רשימת מוסכי הסדר עבור ${formData.insurance_company}...`}
                    </p>
                  </div>
                ) : garageSearchResults.length > 0 ? (
                  <div className="space-y-4">
                    {formData.customer_address && garageSearchType === 'agreement' && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-700 text-sm">
                        <MapPin size={16} />
                        <span>מציג מוסכים באזור: <strong>{formData.customer_address}</strong></span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {garageSearchResults.map((garage, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                              {garage.name}
                              {garage.is_importer && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">מוסך יבואן</span>
                              )}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Building2 size={12} /> {garage.location}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                garage_name: garage.name,
                                garage_phone: garage.phone || prev.garage_phone,
                                garage_settlement: 'מוסך הסדר'
                              }));
                              setIsGarageSearchModalOpen(false);
                              showToast(`המוסך ${garage.name} נבחר`, 'success');
                            }}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            בחר מוסך
                          </button>
                        </div>
                        {garage.phone && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                            <Phone size={12} /> {garage.phone}
                          </p>
                        )}
                        {garage.description && (
                          <p className="text-xs text-slate-500 leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-100">{garage.description}</p>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle size={32} />
                    </div>
                    <p className="text-slate-500">לא נמצאו תוצאות. נסה לחפש ידנית באתר חברת הביטוח.</p>
                    <a 
                      href={INSURANCE_GARAGE_URLS[formData.insurance_company] || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                    >
                      מעבר לאתר {formData.insurance_company} <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400">המידע מבוסס על חיפוש חכם ועשוי להשתנות. מומלץ לוודא מול חברת הביטוח.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && editingClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEmailModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">שליחת מייל</h2>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {emailStep === 'ask' ? (
                  <div className="text-center space-y-6 py-4">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                      <Mail size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">האם ברצונך להוסיף מידע נוסף למייל?</h3>
                      <p className="text-slate-500 mt-1">ניתן לשלוח את המייל עם העדכון האוטומטי או להוסיף תוכן אישי.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setEmailStep('edit')}
                        className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                      >
                        כן, אני רוצה להוסיף מידע
                      </button>
                      <button 
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        {isSendingEmail ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        לא, שלח עכשיו
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">אל</label>
                      <div className="flex gap-2">
                        <input type="email" className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={emailFormData.to} onChange={e => setEmailFormData({...emailFormData, to: e.target.value})} />
                        <select 
                          className="px-4 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50 text-xs"
                          onChange={(e) => setEmailFormData({...emailFormData, to: e.target.value})}
                          value=""
                        >
                          <option value="" disabled>בחר נמען...</option>
                          {editingClaim.customer_email && <option value={editingClaim.customer_email}>לקוח: {editingClaim.customer_name}</option>}
                          {entities.filter(ent => ent.email).map(ent => (
                            <option key={ent.id} value={ent.email}>{ent.type === 'insurance' ? 'ביטוח' : ent.type === 'appraiser' ? 'שמאי' : 'מוסך'}: {ent.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">נושא</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={emailFormData.subject} onChange={e => setEmailFormData({...emailFormData, subject: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">תוכן המייל</label>
                      <textarea rows={6} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none" value={emailFormData.body} onChange={e => setEmailFormData({...emailFormData, body: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">קבצים מצורפים</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                        {Object.keys(DOC_LABELS).map(field => {
                          const path = (editingClaim as any)[field];
                          if (!path) return null;
                          const isSelected = emailFormData.attachments.includes(path);
                          return (
                            <label key={field} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {
                                  const newAttachments = isSelected 
                                    ? emailFormData.attachments.filter(a => a !== path)
                                    : [...emailFormData.attachments, path];
                                  setEmailFormData({...emailFormData, attachments: newAttachments});
                                }}
                                className="rounded text-indigo-600"
                              />
                              <span className="text-xs font-medium text-slate-700 truncate">{DOC_LABELS[field]}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <button 
                        type="button"
                        disabled={isSendingEmail}
                        onClick={handleSendEmail}
                        className={`flex-1 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSendingEmail ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                      >
                        {isSendingEmail ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            שולח...
                          </>
                        ) : (
                          <>
                            <Send size={20} /> שלח מייל
                          </>
                        )}
                      </button>
                      <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">ביטול</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isWhatsAppModalOpen && editingClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWhatsAppModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="text-green-600" size={24} />
                  שליחת וואטסאפ
                </h2>
                <button onClick={() => setIsWhatsAppModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSendWhatsApp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">טלפון</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-green-500" value={whatsAppFormData.to} onChange={e => setWhatsAppFormData({...whatsAppFormData, to: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">מידע נוסף להודעה</label>
                      <input 
                        type="text" 
                        placeholder="הקלד כאן מידע נוסף..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-green-500" 
                        value={whatsAppFormData.additionalInfo} 
                        onChange={e => {
                          const info = e.target.value;
                          const baseMsg = whatsAppFormData.message.split('\nמידע נוסף:')[0];
                          setWhatsAppFormData({
                            ...whatsAppFormData, 
                            additionalInfo: info,
                            message: info ? `${baseMsg}\nמידע נוסף: ${info}` : baseMsg
                          });
                        }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">הודעה סופית (ניתן לעריכה)</label>
                    <textarea rows={6} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-green-500 resize-none text-sm" value={whatsAppFormData.message} onChange={e => setWhatsAppFormData({...whatsAppFormData, message: e.target.value})} />
                  </div>
                  <div className="pt-4 flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200"
                    >
                      <Send size={20} /> שלח בוואטסאפ
                    </button>
                    <button type="button" onClick={() => setIsWhatsAppModalOpen(false)} className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">ביטול</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Submit Claim Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-200 text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-400/20 rounded-xl"><Mail size={24} className="text-purple-600" /></div>
                  <div>
                    <h2 className="text-xl font-bold">הגשת תביעה לחברת הביטוח</h2>
                    <p className="text-sm text-slate-600 opacity-90">{editingClaim?.customer_name} | {editingClaim?.claim_number}</p>
                  </div>
                </div>
                <button onClick={() => setIsSubmitModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Building2 size={18} className="text-purple-400" />
                    <span>חברת ביטוח נתבעת:</span>
                    <span className="text-purple-600">{editingClaim?.third_party_insurance_company || editingClaim?.insurance_company}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">מייל למשלוח (חברת ביטוח צד ג'):</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email"
                        value={submitEmail}
                        onChange={(e) => setSubmitEmail(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                        placeholder="הכנס מייל של חברת הביטוח..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">תוכן המייל (אופציונלי):</label>
                  <textarea
                    value={submitBody}
                    onChange={(e) => setSubmitBody(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-purple-400 focus:ring-0 transition-all min-h-[120px] text-right"
                    placeholder="הוסף מלל למייל..."
                    dir="rtl"
                  />
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                      <Paperclip size={16} />
                      קבצים מצורפים ({submitAttachments.length}):
                    </h4>
                    <label className="cursor-pointer bg-purple-400 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-1">
                      <Plus size={14} />
                      הוסף קובץ ידני
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        onChange={handleAddSubmitAttachment}
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    {submitAttachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded-xl group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <File size={14} className="text-purple-400 shrink-0" />
                          <span className="text-xs text-purple-700 font-medium truncate">
                            {att.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => window.open(att.path, '_blank')}
                            className="p-1.5 text-purple-400 hover:bg-purple-50 rounded-lg transition-colors"
                            title="תצוגה מקדימה"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => setSubmitAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="הסר קובץ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {submitAttachments.length === 0 && (
                      <p className="text-center text-xs text-purple-300 py-2 italic">אין קבצים מצורפים</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={submitClaim}
                  disabled={!submitEmail}
                  className={`px-8 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    submitEmail ? 'bg-purple-400 hover:bg-purple-500 shadow-purple-100' : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                  שלח תביעה
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Add/Edit Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold mb-6">{editingUser ? 'עדכון משתמש' : 'הוספת משתמש חדש'}</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">שם משתמש</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">סיסמה</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">מייל</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">נייד</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">תפקיד</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as any})}>
                    <option value="user">משתמש רגיל</option>
                    <option value="admin">מנהל מערכת (מערכת)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold">שמור</button>
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl">ביטול</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
              toast.type === 'info' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
              'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : 
             toast.type === 'info' ? <Info size={20} /> :
             <AlertCircle size={20} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
              <p className="text-slate-600 mb-8">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 text-white py-3 rounded-xl font-bold transition-colors ${confirmModal.confirmText === 'שלח' || confirmModal.confirmText === 'עדכן וסגור' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  {confirmModal.confirmText || 'מחק'}
                </button>
                {confirmModal.neutralText && (
                  <button 
                    onClick={confirmModal.onNeutral}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    {confirmModal.neutralText}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (confirmModal.onCancel) confirmModal.onCancel();
                    setConfirmModal(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  {confirmModal.cancelText || 'ביטול'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
