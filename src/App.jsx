import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Info,
  FileText,
  SquarePen,
  X,
  ChevronDown,
  ShieldCheck,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  Trash2,
  Eye,
  Send,
  FileCheck2,
  Compass,
  FolderKanban
} from 'lucide-react';

// Student profiles from PHINMA Araullo University
const STUDENT_PROFILES = [
  {
    id: '01-2526-012345',
    name: 'Juan Dela Cruz',
    initials: 'JD',
    email: 'juan.delacruz@student.phinmaaraullo.edu.ph',
    course: 'BSc (IT) 4',
    section: 'AU1S2627-BSIT4-S1-SD'
  },
  {
    id: '01-2324-043261',
    name: 'Ruzzel Henry H. Eugenio',
    initials: 'RE',
    email: 'ruzzel.eugenio@student.phinmaaraullo.edu.ph',
    course: 'BSc (IT) 4',
    section: 'AU1S2627-BSIT4-S1-SD'
  },
  {
    id: '01-2324-040460',
    name: 'Grace J. Sangil',
    initials: 'GS',
    email: 'grace.sangil@student.phinmaaraullo.edu.ph',
    course: 'BSc (IT) 4',
    section: 'AU1S2627-BSIT4-S1-SD'
  },
  {
    id: '01-2223-036316',
    name: 'Gleizie Noreen M. Estipular',
    initials: 'GE',
    email: 'gleizie.estipular@student.phinmaaraullo.edu.ph',
    course: 'BSc (IT) 4',
    section: 'AU1S2627-BSIT4-S1-SD'
  }
];

const SERVICE_CATALOG = [
  {
    label: 'Certificate of Enrollment',
    prefix: 'COE',
    processingTime: '3–5 working days',
    description:
      'Official certification verifying that the student is currently enrolled at PHINMA Araullo University for the active academic term.',
    requirements: ['Valid PHINMA AU School ID', 'Official Receipt from Cashier']
  },
  {
    label: 'Transcript of Records (TOR)',
    prefix: 'TOR',
    processingTime: '5–7 working days',
    description:
      'Comprehensive academic record of all courses taken, grades earned, and units completed across semesters.',
    requirements: ['Valid PHINMA AU School ID', 'Registrar Clearance', 'Official Receipt']
  },
  {
    label: 'Good Moral Certificate',
    prefix: 'GMC',
    processingTime: '2–3 working days',
    description:
      'Official certification attesting to the student’s good moral character and disciplinary standing.',
    requirements: ['Valid PHINMA AU School ID', 'Official Receipt from Cashier']
  },
  {
    label: 'Certificate of Grades',
    prefix: 'COG',
    processingTime: '3–5 working days',
    description:
      'Summary of final grades earned by the student for a specific semester or academic year.',
    requirements: ['Valid PHINMA AU School ID', 'Official Receipt from Cashier']
  },
  {
    label: 'Honorable Dismissal',
    prefix: 'HD',
    processingTime: '5–7 working days',
    description:
      'Transfer credential document required when transferring to another university or institution.',
    requirements: ['Valid PHINMA AU School ID', 'Exit Clearance', 'Official Receipt']
  },
  {
    label: 'Certified True Copy of Diploma',
    prefix: 'CTC',
    processingTime: '3–5 working days',
    description:
      'Authenticated copy of the student’s diploma verified and stamped by the Office of the University Registrar.',
    requirements: ['Original Copy for Verification', 'Valid ID', 'Official Receipt']
  }
];

// Actual Web Application Sidebar Pages
const SIDEBAR_PAGES = [
  { id: 'my-requests', label: 'My Requests', path: '/my-requests', icon: ClipboardList },
  { id: 'new-request', label: 'New Request', path: '/new-request', icon: Plus },
  { id: 'track-request', label: 'Track Request', path: '/track-request', icon: Compass },
  { id: 'service-catalog', label: 'Academic Services', path: '/services', icon: BookOpen },
  { id: 'registrar-portal', label: 'Registrar Office', path: '/registrar', icon: ShieldCheck }
];

function parseLocationToRoute() {
  const path = window.location.pathname;
  if (path.startsWith('/requests/')) {
    const id = decodeURIComponent(path.replace('/requests/', ''));
    return { page: 'request-details', requestId: id };
  }
  if (path === '/new-request') return { page: 'new-request', requestId: null };
  if (path === '/track-request') return { page: 'track-request', requestId: null };
  if (path === '/services') return { page: 'service-catalog', requestId: null };
  if (path === '/registrar') return { page: 'registrar-portal', requestId: null };
  return { page: 'my-requests', requestId: null };
}

export default function App() {
  // Student profile state
  const [currentStudent, setCurrentStudent] = useState(STUDENT_PROFILES[0]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Router state synced with browser history
  const initialRoute = parseLocationToRoute();
  const [activePage, setActivePage] = useState(initialRoute.page);
  const [selectedRequestId, setSelectedRequestId] = useState(initialRoute.requestId);

  // Requests persisted in localStorage
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('phinma_au_requests_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form state inside "New Request" page
  // flowStep: 'form' | 'validation' | 'submitted'
  const [formStep, setFormStep] = useState('form');
  const [formService, setFormService] = useState('Certificate of Enrollment');
  const [formPurpose, setFormPurpose] = useState('');
  const [formEmail, setFormEmail] = useState(STUDENT_PROFILES[0].email);
  const [emailError, setEmailError] = useState('');
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState(null);

  // "Edit Your Request" modal inside the validation step
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalService, setModalService] = useState('Certificate of Enrollment');
  const [modalPurpose, setModalPurpose] = useState('');
  const [modalEmail, setModalEmail] = useState(STUDENT_PROFILES[0].email);
  const [modalError, setModalError] = useState('');

  // My Requests search & status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Track Request lookup state
  const [trackInput, setTrackInput] = useState('');
  const [trackedRequestId, setTrackedRequestId] = useState('');
  const [trackError, setTrackError] = useState('');

  // Registrar Office filter state
  const [registrarFilter, setRegistrarFilter] = useState('ALL');
  const [registrarSearch, setRegistrarSearch] = useState('');

  // Toast notification
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('phinma_au_requests_v2', JSON.stringify(requests));
    } catch {
      // ignore storage errors
    }
  }, [requests]);

  // Browser back/forward button listener
  useEffect(() => {
    const handlePopState = () => {
      const route = parseLocationToRoute();
      setActivePage(route.page);
      setSelectedRequestId(route.requestId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page, reqId = null) => {
    setActivePage(page);
    if (reqId !== undefined) {
      setSelectedRequestId(reqId);
    }
    let targetPath = '/my-requests';
    if (page === 'request-details' && reqId) {
      targetPath = `/requests/${encodeURIComponent(reqId)}`;
    } else {
      const found = SIDEBAR_PAGES.find((p) => p.id === page);
      if (found) targetPath = found.path;
    }
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Switch Student Profile
  const handleSelectStudent = (student) => {
    setCurrentStudent(student);
    setFormEmail(student.email);
    setModalEmail(student.email);
    setShowProfileMenu(false);
    showToast(`Switched active student profile to ${student.name}`);
  };

  // Format date nicely (e.g. September 29, 2026)
  const formatSubmissionDate = () => {
    try {
      return new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'October 26, 2026';
    }
  };

  // Generate sequential reference number like COE-2026-001
  const generateReferenceNumber = (serviceName) => {
    const found = SERVICE_CATALOG.find((s) => s.label === serviceName);
    const prefix = found ? found.prefix : 'REQ';
    const existingWithPrefix = requests.filter((r) => r.id.startsWith(`${prefix}-2026-`));
    const nextNum = existingWithPrefix.length + 1;
    const candidate = `${prefix}-2026-${String(nextNum).padStart(3, '0')}`;
    if (requests.some((r) => r.id === candidate)) {
      return `${prefix}-2026-${String(requests.length + 1).padStart(3, '0')}`;
    }
    return candidate;
  };

  // Start a fresh New Request page
  const handleOpenNewRequest = (preselectedService = 'Certificate of Enrollment') => {
    setFormService(preselectedService);
    setFormPurpose('');
    setFormEmail(currentStudent.email);
    setEmailError('');
    setFormStep('form');
    navigateTo('new-request', null);
  };

  // Finalize and create the request
  const createRequestRecord = (serviceVal, purposeVal, emailVal) => {
    const refId = generateReferenceNumber(serviceVal);
    const newReq = {
      id: refId,
      service: serviceVal,
      purpose: purposeVal.trim(),
      email: emailVal.trim(),
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      dateSubmitted: formatSubmissionDate(),
      status: 'Under Review',
      followUpCount: 0
    };

    setRequests((prev) => [newReq, ...prev]);
    setLastSubmittedRequest(newReq);
    setSelectedRequestId(newReq.id);
    setIsEditModalOpen(false);
    setFormStep('submitted');
    showToast(`Request ${newReq.id} submitted to the Registrar's Office.`, 'success');
  };

  // Submit handler on New Request initial form
  const handleInitialFormSubmit = (e) => {
    e.preventDefault();
    const trimmedPurpose = formPurpose.trim();
    const trimmedEmail = formEmail.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setEmailError('Please enter a valid student email address.');
    } else {
      setEmailError('');
    }

    // If Purpose or Email is missing, transition form into the validation step
    // (Shows the "Missing required information" screen with preserved data & Edit Full Form option)
    if (!trimmedPurpose || !trimmedEmail || !trimmedEmail.includes('@')) {
      setFormStep('validation');
      return;
    }

    createRequestRecord(formService, trimmedPurpose, trimmedEmail);
  };

  // Submit handler on the validation screen (after user fills in the missing field)
  const handleValidationStepSubmit = (e) => {
    e.preventDefault();
    const trimmedPurpose = formPurpose.trim();
    const trimmedEmail = formEmail.trim();

    if (!trimmedPurpose) {
      showToast('Please enter the purpose of your request before submitting.', 'error');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showToast('Please provide a valid contact email address.', 'error');
      return;
    }

    createRequestRecord(formService, trimmedPurpose, trimmedEmail);
  };

  // Open "Edit Your Request" modal
  const handleOpenEditModal = () => {
    setModalService(formService);
    setModalPurpose(formPurpose);
    setModalEmail(formEmail || currentStudent.email);
    setModalError('');
    setIsEditModalOpen(true);
  };

  // Submit inside "Edit Your Request" modal
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const trimmedPurpose = modalPurpose.trim();
    const trimmedEmail = modalEmail.trim();

    if (!trimmedPurpose) {
      setModalError('Please enter the purpose of your request.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setModalError('Please enter a valid contact email.');
      return;
    }

    setFormService(modalService);
    setFormPurpose(trimmedPurpose);
    setFormEmail(trimmedEmail);
    setModalError('');
    createRequestRecord(modalService, trimmedPurpose, trimmedEmail);
  };

  // Staff updates a request's status
  const handleUpdateRequestStatus = (reqId, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
    showToast(`Request ${reqId} status updated to ${newStatus}.`, 'success');
  };

  // Student sends a follow-up on an Under Review request
  const handleFollowUp = (reqId) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId ? { ...r, followUpCount: (r.followUpCount || 0) + 1 } : r
      )
    );
    showToast(`Follow-up notification sent to the Registrar's Office for ${reqId}.`, 'info');
  };

  // Delete request
  const handleDeleteRequest = (reqId, e) => {
    if (e) e.stopPropagation();
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    if (selectedRequestId === reqId) {
      setSelectedRequestId(null);
      navigateTo('my-requests', null);
    }
    if (trackedRequestId === reqId) {
      setTrackedRequestId('');
    }
    showToast(`Deleted request ${reqId}.`, 'info');
  };

  // Lookup request on Track Request page
  const handleTrackSearch = (e) => {
    e.preventDefault();
    const query = trackInput.trim().toUpperCase();
    if (!query) {
      setTrackError('Please enter a reference number (e.g., COE-2026-001).');
      return;
    }
    const found = requests.find((r) => r.id.toUpperCase() === query);
    if (!found) {
      setTrackError(`No request found matching reference number "${trackInput.trim()}".`);
      setTrackedRequestId('');
      return;
    }
    setTrackError('');
    setTrackedRequestId(found.id);
  };

  // Currently selected request for Request Details view
  const activeRequest =
    requests.find((r) => r.id === selectedRequestId) ||
    lastSubmittedRequest ||
    requests[0] ||
    null;

  // Filtered requests on My Requests page
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered requests on Registrar Office page
  const registrarFilteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(registrarSearch.toLowerCase()) ||
      req.service.toLowerCase().includes(registrarSearch.toLowerCase()) ||
      req.studentName.toLowerCase().includes(registrarSearch.toLowerCase()) ||
      req.purpose.toLowerCase().includes(registrarSearch.toLowerCase());
    const matchesStatus = registrarFilter === 'ALL' || req.status === registrarFilter;
    return matchesSearch && matchesStatus;
  });

  const isValidationStepComplete =
    formPurpose.trim().length > 0 && formEmail.trim().length > 0 && formEmail.includes('@');

  const pendingCount = requests.filter((r) => r.status === 'Under Review').length;

  // Determine which sidebar item is highlighted
  const activeSidebarId =
    activePage === 'request-details' ? 'my-requests' : activePage;

  // Reusable Request Details Renderer (used in Request Details view and Track Request view)
  const renderRequestDetailsContent = (req, showBackButton = true) => {
    if (!req) return null;
    const isApproved = req.status === 'Approved';

    return (
      <div>
        {/* Main Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-6 sm:p-8">
          {/* Top Row: Service & Status Pill */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                SERVICE
              </div>
              <div className="text-[17px] font-bold text-slate-800 mt-0.5">
                {req.service}
              </div>
            </div>
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11.5px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11.5px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Under Review
              </span>
            )}
          </div>

          <hr className="border-slate-100 my-5" />

          {/* Reference Number & Date Submitted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                REFERENCE NUMBER
              </div>
              <div className="font-mono-ref text-[14px] font-bold text-[#163A6C] mt-0.5">
                {req.id}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DATE SUBMITTED
              </div>
              <div className="text-[13px] font-medium text-slate-700 mt-0.5">
                {req.dateSubmitted}
              </div>
            </div>
          </div>

          {/* Student & Contact Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                STUDENT
              </div>
              <div className="text-[13px] font-medium text-slate-700 mt-0.5">
                {req.studentName} ({req.studentId})
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                CONTACT EMAIL
              </div>
              <div className="text-[13px] font-medium text-slate-700 mt-0.5 truncate">
                {req.email}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              PURPOSE
            </div>
            <div className="text-[13px] font-medium text-slate-700 mt-0.5">
              {req.purpose}
            </div>
          </div>

          {/* Status-Specific Callouts & Instructions */}
          {!isApproved ? (
            <>
              {/* Blue Info Callout Box */}
              <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                  i
                </div>
                <div className="text-[12.5px] leading-relaxed text-blue-900">
                  <div className="font-bold text-blue-800 mb-0.5">
                    Request Received — Under Review
                  </div>
                  <p className="text-blue-700">
                    Your request has been received and is currently being processed by the Registrar&apos;s Office. Please allow{' '}
                    <strong className="font-bold text-blue-900">3–5 working days</strong>{' '}
                    for processing. You will be notified at your registered email address once a decision has been made.
                  </p>
                </div>
              </div>

              {/* What Happens Next Card */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-5">
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-3.5">
                  WHAT HAPPENS NEXT
                </div>
                <ol className="space-y-3 text-[12.5px] text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#163A6C] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      The Registrar&apos;s Office reviews your request and verifies your student records.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#163A6C] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      You will receive an email notification when your request status changes.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#163A6C] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Once approved, follow the next steps provided on the status page to claim your document.
                    </span>
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <>
              {/* Green Approved Callout Box */}
              <div className="bg-[#ECFDF5] border border-emerald-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="text-[12.5px] leading-relaxed text-emerald-900">
                  <div className="font-bold text-emerald-800 mb-0.5">
                    Request Approved
                  </div>
                  <p className="text-emerald-700">
                    Your <strong className="font-bold text-emerald-900">{req.service}</strong> request has been approved by the Registrar&apos;s Office. Please follow the steps below to claim your document.
                  </p>
                </div>
              </div>

              {/* Next Steps — How to Claim Your Document Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-widest text-[#163A6C] mb-4">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>NEXT STEPS — HOW TO CLAIM YOUR DOCUMENT</span>
                </div>

                <ol className="space-y-4">
                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#163A6C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        Visit the Registrar&apos;s Office
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Proceed to the Registrar&apos;s Office during office hours: Monday to Friday, 8:00 AM – 5:00 PM.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#163A6C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        Present your School ID and Reference Number
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Bring a valid PHINMA Araullo University School ID and quote your reference number —{' '}
                        <span className="font-mono-ref font-semibold text-slate-700">
                          {req.id}
                        </span>{' '}
                        — at the counter.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#163A6C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        Pay the Processing Fee at the Cashier
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Proceed to the Cashier&apos;s Office to pay the applicable document processing fee. Keep your official receipt.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#163A6C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        Return to Claim Your Document
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Present your official receipt to the Registrar&apos;s Office to receive your document.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {showBackButton ? (
            <button
              onClick={() => navigateTo('my-requests', null)}
              className="bg-white hover:bg-slate-50 text-[#163A6C] font-semibold text-[12.5px] px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to My Requests</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            {!isApproved && (
              <>
                <button
                  onClick={() => handleFollowUp(req.id)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[12.5px] px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#163A6C]" />
                  <span>
                    Follow Up {req.followUpCount ? `(${req.followUpCount})` : ''}
                  </span>
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus(req.id, 'Approved')}
                  className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[12.5px] px-4 py-2.5 rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Request (Registrar)</span>
                </button>
              </>
            )}

            {isApproved && (
              <button
                onClick={() => handleUpdateRequestStatus(req.id, 'Under Review')}
                className="bg-white hover:bg-slate-50 text-slate-600 font-medium text-[12px] px-3.5 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Revert to Under Review
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all bg-[#163A6C] text-white border-blue-800">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-200 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-blue-200 hover:text-white"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER BAR — PHINMA Araullo University Navy Header */}
      <header className="bg-[#163A6C] text-white h-14 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
        {/* Left Brand */}
        <div
          onClick={() => navigateTo('my-requests', null)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#D9A11C] text-[#163A6C] font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
            AU
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[13.5px] tracking-tight text-white">
              PHINMA Araullo University
            </div>
            <div className="text-[11px] text-blue-200/85 font-normal">
              Student Portal — Academic Services
            </div>
          </div>
        </div>

        {/* Right Student Profile Selector */}
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 text-right hover:bg-white/5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            title="Switch active student"
          >
            <div className="leading-tight hidden sm:block">
              <div className="font-semibold text-[12.5px] text-white flex items-center justify-end gap-1">
                <span>{currentStudent.name}</span>
                <ChevronDown className="w-3 h-3 text-blue-200/80" />
              </div>
              <div className="text-[10.5px] text-blue-200/80">
                Student ID: {currentStudent.id}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2B5288] border border-blue-300/25 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {currentStudent.initials}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-12 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Student Profile
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {STUDENT_PROFILES.map((stu) => {
                    const isSelected = stu.id === currentStudent.id;
                    return (
                      <button
                        key={stu.id}
                        onClick={() => handleSelectStudent(stu)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#163A6C] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stu.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                            <span className="truncate">{stu.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#163A6C] shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ID: {stu.id}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {stu.course} • {stu.section}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* LEFT SIDEBAR — Actual Application Pages */}
        <aside className="w-full md:w-56 bg-[#F4F6F9] md:border-r border-b md:border-b-0 border-slate-200/80 p-3.5 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2.5 mb-2">
            SERVICES
          </div>

          <nav
            aria-label="Academic Services Navigation"
            className="bg-white rounded-xl border border-slate-200/90 p-1.5 shadow-2xs space-y-0.5"
          >
            {SIDEBAR_PAGES.map((item) => {
              const isActive = activeSidebarId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'new-request') {
                      handleOpenNewRequest('Certificate of Enrollment');
                    } else {
                      navigateTo(item.id, null);
                    }
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[12.5px] transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#163A6C] text-white font-semibold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'my-requests' && requests.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {requests.length}
                    </span>
                  )}
                  {item.id === 'registrar-portal' && pendingCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#D9A11C] text-[#163A6C]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 py-8 px-4 sm:px-8 lg:px-12 overflow-y-auto">
          <div className="max-w-[680px] mx-auto">
            {/* =================================================================
                PAGE 1: MY REQUESTS
               ================================================================= */}
            {activePage === 'my-requests' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                      My Requests
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1 max-w-md leading-relaxed">
                      Submit and track your academic service requests. All requests are processed by the Registrar&apos;s Office.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenNewRequest('Certificate of Enrollment')}
                    className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="leading-tight text-left">
                      New
                      <br className="hidden sm:inline" /> Request
                    </span>
                  </button>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs py-14 px-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] text-[#163A6C] flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h2 className="text-[15px] font-bold text-slate-800">
                      No requests yet
                    </h2>
                    <p className="text-[12.5px] text-slate-400 mt-1.5">
                      You haven&apos;t submitted any academic service requests.
                    </p>
                    <button
                      onClick={() => handleOpenNewRequest('Certificate of Enrollment')}
                      className="mt-5 text-[12.5px] font-bold text-[#163A6C] hover:underline cursor-pointer inline-block"
                    >
                      Get started — click New Request above
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search & Status Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by reference number, document, or purpose..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#163A6C]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {['ALL', 'Under Review', 'Approved'].map((statusOption) => (
                          <button
                            key={statusOption}
                            onClick={() => setStatusFilter(statusOption)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              statusFilter === statusOption
                                ? 'bg-[#163A6C] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {statusOption === 'ALL' ? 'All' : statusOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submitted Requests List */}
                    {filteredRequests.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/85 p-8 text-center text-xs text-slate-500">
                        No requests match your current search or filter.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredRequests.map((req) => {
                          const isApproved = req.status === 'Approved';
                          return (
                            <div
                              key={req.id}
                              onClick={() => navigateTo('request-details', req.id)}
                              className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#163A6C]/50 shadow-2xs hover:shadow-md p-5 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="font-bold text-[15px] text-slate-800 group-hover:text-[#163A6C] transition-colors">
                                    {req.service}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                    <span className="font-mono-ref font-bold text-[#163A6C]">
                                      {req.id}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500">
                                      Submitted {req.dateSubmitted}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 pt-1 line-clamp-1">
                                    <span className="text-slate-400 font-medium">Purpose: </span>
                                    {req.purpose}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end gap-2.5 shrink-0">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                      Under Review
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#163A6C] opacity-85 group-hover:opacity-100">
                                    <span>View Request Status</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                PAGE: REQUEST DETAILS (Opened when clicking a request or "View Request Status")
               ================================================================= */}
            {activePage === 'request-details' && (
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <button
                    onClick={() => navigateTo('my-requests', null)}
                    className="font-semibold text-[#163A6C] hover:underline cursor-pointer"
                  >
                    My Requests
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-500 font-mono-ref">
                    {activeRequest ? activeRequest.id : 'Request Details'}
                  </span>
                </div>

                <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                  Request Details
                </h1>
                <p className="text-[13px] text-slate-500 mt-1 mb-6">
                  Track the current status of your submitted request.
                </p>

                {activeRequest ? (
                  renderRequestDetailsContent(activeRequest, true)
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/85 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Request not found
                    </p>
                    <button
                      onClick={() => navigateTo('my-requests', null)}
                      className="mt-4 bg-[#163A6C] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Back to My Requests
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                PAGE 2: NEW REQUEST
                Handles the entire request creation lifecycle naturally:
                - Step 'form': Initial New Request form
                - Step 'validation': Missing required information alert & field correction / Edit Full Form modal
                - Step 'submitted': Request Submitted confirmation with reference number
               ================================================================= */}
            {activePage === 'new-request' && (
              <div>
                {formStep !== 'submitted' ? (
                  <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs mb-3">
                      <button
                        onClick={() => navigateTo('my-requests', null)}
                        className="font-semibold text-[#163A6C] hover:underline cursor-pointer"
                      >
                        My Requests
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-slate-500">New Request</span>
                    </div>

                    <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                      New Request
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1 mb-6">
                      Complete the fields below to submit your document request.
                    </p>

                    {/* Initial Form View */}
                    {formStep === 'form' && (
                      <form
                        onSubmit={handleInitialFormSubmit}
                        noValidate
                        className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-6 sm:p-8"
                      >
                        {/* Document / Service */}
                        <div>
                          <label
                            htmlFor="service-select"
                            className="block text-[12.5px] font-bold text-slate-800 mb-2"
                          >
                            Document / Service <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="service-select"
                              value={formService}
                              onChange={(e) => setFormService(e.target.value)}
                              className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-[#163A6C] rounded-xl px-4 py-3 text-[13px] text-slate-800 font-medium focus:outline-none transition-colors pr-10 cursor-pointer"
                            >
                              {SERVICE_CATALOG.map((opt) => (
                                <option key={opt.label} value={opt.label}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <hr className="border-slate-100 my-6" />

                        {/* Purpose */}
                        <div className="mb-5">
                          <label
                            htmlFor="purpose-input"
                            className="block text-[12.5px] font-bold text-slate-800 mb-2"
                          >
                            Purpose <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="purpose-input"
                            rows={3}
                            value={formPurpose}
                            onChange={(e) => setFormPurpose(e.target.value)}
                            placeholder="e.g., For scholarship application, For employment purposes, For CHED scholarship requirement..."
                            className="w-full bg-white border border-slate-200 focus:border-[#163A6C] rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors resize-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Clearly state the intended use of this document.
                          </p>
                        </div>

                        {/* Contact Email */}
                        <div>
                          <label
                            htmlFor="email-input"
                            className="block text-[12.5px] font-bold text-slate-800 mb-2"
                          >
                            Contact Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email-input"
                            type="email"
                            value={formEmail}
                            onChange={(e) => {
                              setFormEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            placeholder="juan.delacruz@student.phinmaaraullo.edu.ph"
                            className="w-full bg-white border border-slate-200 focus:border-[#163A6C] rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
                          />
                          {emailError ? (
                            <p className="text-[11px] text-red-600 mt-1.5 font-medium">
                              {emailError}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1.5">
                              Updates about your request will be sent to this address.
                            </p>
                          )}
                        </div>

                        <hr className="border-slate-100 my-6" />

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[13px] px-6 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Submit Request
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateTo('my-requests', null)}
                            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] px-5 py-2.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          >
                            Back
                          </button>
                          <span className="text-[11px] text-slate-400 ml-1">
                            <span className="text-red-500">*</span> Required fields
                          </span>
                        </div>
                      </form>
                    )}

                    {/* Validation View (Triggered when submitting with Purpose empty) */}
                    {formStep === 'validation' && (
                      <div>
                        {isValidationStepComplete ? (
                          <div className="bg-[#ECFDF5] border border-emerald-400 rounded-xl p-4 mb-5 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <div className="text-[12.5px] leading-snug">
                              <div className="font-bold text-emerald-800">
                                All required fields are complete
                              </div>
                              <div className="text-emerald-700 mt-0.5">
                                Click Submit Request to continue.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#FEF2F2] border border-red-300 rounded-xl p-4 mb-5 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                              !
                            </div>
                            <div className="text-[12.5px] leading-snug">
                              <div className="font-bold text-red-700">
                                Missing required information
                              </div>
                              <div className="text-red-600 mt-0.5">
                                Please correct the field below before submitting your request.
                              </div>
                            </div>
                          </div>
                        )}

                        <form
                          onSubmit={handleValidationStepSubmit}
                          noValidate
                          className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-6 sm:p-8"
                        >
                          {/* Preserved Document / Service */}
                          <div>
                            <label className="block text-[12.5px] font-bold text-slate-800 mb-2">
                              Document / Service
                            </label>
                            <div className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-4 py-3 text-[13px] text-slate-700 font-medium flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-[#163A6C] shrink-0" />
                              <span>{formService}</span>
                            </div>
                          </div>

                          <hr className="border-slate-100 my-6" />

                          {/* Purpose Field */}
                          <div className="mb-5">
                            <label
                              htmlFor="validation-purpose-input"
                              className="block text-[12.5px] font-bold text-slate-800 mb-2"
                            >
                              Purpose <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              id="validation-purpose-input"
                              rows={3}
                              value={formPurpose}
                              onChange={(e) => setFormPurpose(e.target.value)}
                              placeholder="e.g., For scholarship application, For employment purposes..."
                              className={`w-full rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors resize-none border ${
                                isValidationStepComplete
                                  ? 'bg-white border-emerald-500 focus:border-emerald-600'
                                  : 'bg-[#FFF5F5] border-red-400 focus:border-red-500'
                              }`}
                            />
                            {!isValidationStepComplete && (
                              <div className="flex items-center gap-1.5 text-[11.5px] text-red-600 font-medium mt-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                                  !
                                </span>
                                <span>Please enter the purpose of your request.</span>
                              </div>
                            )}
                          </div>

                          {/* Preserved Contact Email */}
                          <div>
                            <label className="block text-[12.5px] font-bold text-slate-800 mb-2">
                              Contact Email <span className="text-red-500">*</span>
                            </label>
                            <div className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-4 py-3 text-[13px] text-slate-600">
                              {formEmail}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5">
                              Your entered information has been preserved.
                            </p>
                          </div>

                          <hr className="border-slate-100 my-6" />

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="submit"
                              className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[13px] px-6 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              Submit Request
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenEditModal}
                              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit Full Form</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  /* Submission Confirmation View */
                  <div>
                    <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                      Request Submitted
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1 mb-6">
                      Your request has been received by the Registrar&apos;s Office.
                    </p>

                    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs py-10 px-6 sm:px-10 text-center">
                      <div className="w-14 h-14 rounded-full bg-[#D1FAE5] text-emerald-600 flex items-center justify-center mx-auto mb-5">
                        <Check className="w-6 h-6 stroke-[2.5]" />
                      </div>

                      <h2 className="text-[18px] font-bold text-[#163A6C]">
                        Your request has been submitted.
                      </h2>
                      <p className="text-[12.5px] text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                        We will review your request and update its status. Keep your reference number for your records.
                      </p>

                      {lastSubmittedRequest && (
                        <div className="max-w-[360px] mx-auto bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-5 text-left my-7">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            REFERENCE NUMBER
                          </div>
                          <div className="font-mono-ref text-[22px] font-bold text-[#163A6C] tracking-wide mt-0.5">
                            {lastSubmittedRequest.id}
                          </div>

                          <hr className="border-slate-200/80 my-3.5" />

                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                SERVICE
                              </div>
                              <div className="text-[13px] font-bold text-slate-800 mt-0.5">
                                {lastSubmittedRequest.service}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                STATUS
                              </div>
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                {lastSubmittedRequest.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            navigateTo(
                              'request-details',
                              lastSubmittedRequest ? lastSubmittedRequest.id : null
                            )
                          }
                          className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[13px] px-6 py-3 rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <span>View Request Status</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                PAGE 3: TRACK REQUEST (Look up any request by Reference Number)
               ================================================================= */}
            {activePage === 'track-request' && (
              <div>
                <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                  Track Request
                </h1>
                <p className="text-[13px] text-slate-500 mt-1 mb-6">
                  Enter your reference number (e.g., <span className="font-mono-ref font-semibold text-slate-700">COE-2026-001</span>) to check live processing status and claiming instructions.
                </p>

                {/* Lookup Card */}
                <form
                  onSubmit={handleTrackSearch}
                  className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-6 mb-6"
                >
                  <label
                    htmlFor="track-ref-input"
                    className="block text-[12px] font-bold text-slate-800 mb-2"
                  >
                    Reference Number
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="track-ref-input"
                        type="text"
                        value={trackInput}
                        onChange={(e) => {
                          setTrackInput(e.target.value);
                          if (trackError) setTrackError('');
                        }}
                        placeholder="e.g., COE-2026-001"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-[#163A6C] rounded-xl text-[13px] font-mono-ref text-slate-800 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[13px] px-6 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Track Status
                    </button>
                  </div>

                  {trackError && (
                    <div className="mt-2.5 text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  {requests.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Your Recent Reference Numbers:
                      </span>
                      {requests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setTrackInput(r.id);
                            setTrackedRequestId(r.id);
                            setTrackError('');
                          }}
                          className={`text-[11px] font-mono-ref font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            trackedRequestId === r.id
                              ? 'bg-[#163A6C] text-white border-[#163A6C]'
                              : 'bg-slate-50 text-[#163A6C] border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          {r.id}
                        </button>
                      ))}
                    </div>
                  )}
                </form>

                {/* Tracked Result Details */}
                {trackedRequestId &&
                  renderRequestDetailsContent(
                    requests.find((r) => r.id === trackedRequestId),
                    false
                  )}
              </div>
            )}

            {/* =================================================================
                PAGE 4: ACADEMIC SERVICES CATALOG
               ================================================================= */}
            {activePage === 'service-catalog' && (
              <div>
                <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                  Academic Services
                </h1>
                <p className="text-[13px] text-slate-500 mt-1 mb-6">
                  Official academic documents available for request from the PHINMA Araullo University Registrar&apos;s Office.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {SERVICE_CATALOG.map((service) => (
                    <div
                      key={service.label}
                      className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-[15.5px] font-bold text-slate-800">
                            {service.label}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-[#163A6C] border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {service.processingTime}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Claiming Requirements:
                          </span>
                          {service.requirements.map((reqItem) => (
                            <span
                              key={reqItem}
                              className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                            >
                              {reqItem}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenNewRequest(service.label)}
                        className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[12.5px] px-4 py-2.5 rounded-xl shrink-0 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Request Document</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================================
                PAGE 5: REGISTRAR OFFICE (Staff Request Management Page)
               ================================================================= */}
            {activePage === 'registrar-portal' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#163A6C] tracking-tight">
                      Registrar Office
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1">
                      Review incoming student document requests, verify academic records, and update request statuses.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pending Review
                      </div>
                      <div className="text-sm font-bold text-[#163A6C]">
                        {pendingCount} Request{pendingCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs py-14 px-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] text-[#163A6C] flex items-center justify-center mx-auto mb-4">
                      <FileCheck2 className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h2 className="text-[15px] font-bold text-slate-800">
                      No student requests in the queue
                    </h2>
                    <p className="text-[12.5px] text-slate-400 mt-1.5">
                      Submitted student requests will appear here for verification and approval.
                    </p>
                    <button
                      onClick={() => handleOpenNewRequest('Certificate of Enrollment')}
                      className="mt-5 text-[12.5px] font-bold text-[#163A6C] hover:underline cursor-pointer inline-block"
                    >
                      Submit a new student request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={registrarSearch}
                          onChange={(e) => setRegistrarSearch(e.target.value)}
                          placeholder="Search by reference ID, student name, or document..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#163A6C]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {['ALL', 'Under Review', 'Approved'].map((statusOpt) => (
                          <button
                            key={statusOpt}
                            onClick={() => setRegistrarFilter(statusOpt)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              registrarFilter === statusOpt
                                ? 'bg-[#163A6C] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {statusOpt === 'ALL' ? 'All' : statusOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {registrarFilteredRequests.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/85 p-8 text-center text-xs text-slate-500">
                        No requests match the selected filter.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {registrarFilteredRequests.map((req) => {
                          const isApproved = req.status === 'Approved';
                          return (
                            <div
                              key={req.id}
                              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-mono-ref font-bold text-xs text-[#163A6C] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                                      {req.id}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {req.dateSubmitted}
                                    </span>
                                    {req.followUpCount > 0 && (
                                      <span className="text-[10.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                                        Follow-up requested ({req.followUpCount})
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-[15.5px] font-bold text-slate-800 mt-1.5">
                                    {req.service}
                                  </h3>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Student: <strong className="text-slate-700">{req.studentName}</strong> ({req.studentId}) • {req.email}
                                  </p>
                                </div>

                                <div className="shrink-0">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                      Under Review
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-xl px-4 py-2.5 text-xs text-slate-700">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">
                                  Stated Purpose
                                </span>
                                {req.purpose}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleUpdateRequestStatus(req.id, 'Under Review')
                                    }
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                      !isApproved
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    Mark Under Review
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateRequestStatus(req.id, 'Approved')
                                    }
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                      isApproved
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-[#163A6C] text-white border-[#163A6C] hover:bg-[#102C54]'
                                    }`}
                                  >
                                    {isApproved ? 'Approved' : 'Approve Request'}
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => navigateTo('request-details', req.id)}
                                    className="px-3 py-1.5 text-xs font-semibold text-[#163A6C] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteRequest(req.id, e)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete request"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================================
          MODAL: "EDIT YOUR REQUEST" (Opened when clicking "Edit Full Form")
         ===================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-[460px] w-full p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#163A6C]">
                  Edit Your Request
                </h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Update the fields below and submit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} noValidate className="space-y-4">
              {/* Document / Service */}
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">
                  Document / Service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={modalService}
                    onChange={(e) => setModalService(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 focus:border-[#163A6C] rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 font-medium focus:outline-none pr-9 cursor-pointer"
                  >
                    {SERVICE_CATALOG.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  autoFocus
                  value={modalPurpose}
                  onChange={(e) => {
                    setModalPurpose(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder="e.g., For scholarship application, For employment purposes, For CHED scholarship requirement..."
                  className="w-full bg-white border-2 border-[#163A6C] rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-[12px] font-bold text-slate-800 mb-1.5">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => {
                    setModalEmail(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-[#163A6C] rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="submit"
                  className="bg-[#163A6C] hover:bg-[#102C54] text-white font-semibold text-[12.5px] px-5 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[12.5px] px-4 py-2.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <span className="text-[11px] text-slate-400 ml-1">
                  <span className="text-red-500">*</span> Required
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
