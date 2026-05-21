# Refactor Plan — Large File Splitting

## 1. `src/features/settings/pages/SettingsPage.tsx` — **1338 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Reusable UI Components | ~30–196 | SectionCard, SectionTitle, InputField, TextAreaField, Toggle, PrimaryBtn, SecondaryBtn, DangerBtn, ToggleRow |
| Main Component State & Setup | ~199–267 | All `useState`, destructured context, local state |
| Backup Export/Import | ~270–319 | `handleExportBackup`, `handleImportBackup` |
| System Reset/Archive | ~321–354 | `triggerReset`, `triggerArchive` |
| Effects & Save Handlers | ~356–426 | `useEffect` syncs, `fetchLogs`, `handleSaveGeneral` |
| User Action Handler | ~428–437 | `handleUserAction` |
| Loading State | ~449–457 | Skeleton loader |
| Header | ~462–477 | Title bar |
| Tab Navigation | ~480–500 | Tab buttons |
| Tab: General Settings | ~506–596 | Academy identity, financial settings |
| Tab: Mobile Settings | ~599–638 | Haptics toggle |
| Tab: Appearance/Branding | ~641–770 | Theme colors, banners, backup/restore buttons |
| Tab: Users Management | ~773–914 | User cards, add/edit user form, permissions |
| Tab: Policies | ~917–1025 | Backdate lock, commission type, auto-freeze |
| Tab: Advanced | ~1028–1125 | WhatsApp automation, reminders, semesters, factory reset |
| Tab: Audit Log | ~1128–1196 | Activity log table |
| Secure Action Modal | ~1200–1238 | Confirmation for dangerous actions |
| Delete User Modal | ~1241–1267 | User deletion confirmation |
| Maintenance Modal | ~1269–1324 | Maintenance mode activation |
| Success Toast | ~1327–1334 | Notification popup |

### Recommended Extractions
1. **`settings/components/SettingsUI.tsx`** — All reusable components (SectionCard, SectionTitle, InputField, Toggle, buttons)
2. **`settings/components/GeneralSettings.tsx`** — General tab content
3. **`settings/components/AppearanceSettings.tsx`** — Appearance tab content
4. **`settings/components/UsersSettings.tsx`** — Users tab content (+ UserCard, AddUserForm)
5. **`settings/components/PoliciesSettings.tsx`** — Policies tab content
6. **`settings/components/AdvancedSettings.tsx`** — Advanced tab content
7. **`settings/components/AuditLog.tsx`** — Audit log table
8. **`settings/components/SecureActionModal.tsx`** — Secure action confirmation
9. **`settings/components/DeleteUserModal.tsx`** — Delete user confirmation
10. **`settings/components/MaintenanceModal.tsx`** — Maintenance mode dialog
11. **`settings/components/SuccessToast.tsx`** — Success notification

---

## 2. `src/pages/MonthlyClosing.tsx` — **823 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Reusable UI Components | ~22–84 | SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, StatItem |
| SalarySlipModal | ~87–173 | Teacher salary slip modal |
| Main Component State & Setup | ~177–212 | State, date range, adjustments |
| Data Fetching | ~215–238 | useQuery hooks for sessions, teachers, students, invoices |
| Teacher Payroll Logic | ~243–260 | Compute payroll per teacher |
| Subject Profitability Logic | ~263–276 | Compute subject-level profit/loss |
| Teacher Performance Logic | ~279–295 | Compute attendance/documentation rates |
| Student Renewals Logic | ~298–319 | Low-balance renewals |
| Summary Stats | ~322–328 | Projected income, collections, payout |
| Loading State | ~330–332 | PageLoader |
| Header | ~338–390 | Title, semester picker, date range, buttons |
| Stats Grid | ~393–426 | KPI cards |
| Navigation Tabs | ~429–455 | Tab bar |
| Tab: Payroll | ~459–517 | Teacher payroll table |
| Tab: Collections | ~519–566 | Income collection table |
| Tab: Renewals | ~568–598 | Low-balance student cards |
| Tab: Analysis | ~600–638 | Subject profitability chart + cards |
| Tab: Teachers | ~640–666 | Teacher performance cards |
| Tab: Compensation | ~668–706 | Cancelled sessions requiring makeup |
| Tab: Summary | ~708–809 | Strategic financial summary |
| Salary Slip Modal | ~813–819 | Modal trigger |

### Recommended Extractions
1. **`monthly-closing/components/ClosingUI.tsx`** — SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, StatItem
2. **`monthly-closing/components/SalarySlipModal.tsx`** — The salary slip modal
3. **`monthly-closing/components/PayrollTable.tsx`** — Payroll tab content
4. **`monthly-closing/components/CollectionsTable.tsx`** — Collections tab content
5. **`monthly-closing/components/RenewalsCards.tsx`** — Renewals tab content
6. **`monthly-closing/components/SubjectAnalysis.tsx`** — Analysis tab (chart + cards)
7. **`monthly-closing/components/TeacherPerformance.tsx`** — Teacher performance cards
8. **`monthly-closing/components/CompensationTable.tsx`** — Compensation tab content
9. **`monthly-closing/components/StrategicSummary.tsx`** — Summary tab content

---

## 3. `src/pages/StudentInvoices.tsx` — **770 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Type Definitions | ~15–42 | StudentInvoice, Student interfaces |
| Reusable UI Components | ~46–138 | SectionCard, SectionTitle, InputField, buttons |
| Main Component State & Setup | ~142–181 | State, form data, confirm modal |
| Data Fetching | ~182–202 | fetchData, useEffect |
| Filtered Invoices | ~204–213 | useMemo filter |
| CRUD Handlers | ~215–365 | Edit, Cancel, Submit, Toggle, Delete |
| Import Students | ~367–454 | Auto-import from sessions |
| Stats Computations | ~457–462 | Revenue, counts |
| Loading State | ~463 | PageLoader |
| Header | ~471–485 | Title bar |
| Stats Grid | ~488–507 | KPI cards |
| Action Bar | ~510–553 | Search, filter, buttons |
| Invoice Form | ~557–635 | Add/edit form |
| Invoice Table | ~638–731 | Data table |
| Modals | ~734–766 | ConfirmModal, InvoicePreviewModal |

### Recommended Extractions
1. **`student-invoices/components/InvoiceUI.tsx`** — Reusable styled components
2. **`student-invoices/components/InvoiceForm.tsx`** — The add/edit form
3. **`student-invoices/components/InvoiceTable.tsx`** — The data table
4. **`student-invoices/components/InvoiceStats.tsx`** — Stats KPI grid
5. **`student-invoices/components/ImportStudents.tsx`** — Import logic

---

## 4. `src/pages/public/Home.tsx` — **740 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Main Component State & Setup | ~12–25 | State, banner parsing |
| Typewriter Effect | ~26–55 | Typewriter animation |
| Reviews Data | ~57–100 | Static review objects |
| Auto-rotate Reviews | ~102–107 | Interval for carousel |
| Hero Section | ~126–240 | Hero + banner strip |
| Why Choose Us | ~243–331 | Feature grid |
| Quran Memorization | ~334–441 | Quran program section |
| How It Works | ~444–561 | 3-step process |
| Testimonials | ~564–656 | Review carousel |
| MasarSection | ~661 | Imported MasarSection component |
| FAQ Section | ~664–735 | Accordion FAQ |
| Footer | ~737 | PublicFooter component |

### Recommended Extractions
1. **`public/components/HeroSection.tsx`** — Hero section (typewriter, CTA, banners)
2. **`public/components/WhyChooseUs.tsx`** — Why choose us grid
3. **`public/components/QuranSection.tsx`** — Quran memorization block
4. **`public/components/HowItWorks.tsx`** — How it works 3-step
5. **`public/components/Testimonials.tsx`** — Reviews carousel
6. **`public/components/FAQSection.tsx`** — FAQ accordion
7. **`public/components/ReviewsData.ts`** — Static reviews data

---

## 5. `src/pages/TeacherInvoices.tsx` — **737 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Reusable UI Components | ~23–115 | SectionCard, SectionTitle, InputField, buttons |
| Main Component State & Setup | ~119–161 | State, form data, confirm modal |
| Data Fetching | ~164–189 | fetchInvoices, useEffect |
| Filters & Stats | ~192–238 | useMemo filter + stats computation |
| CRUD Handlers | ~241–347 | Edit, Cancel, Submit, Delete |
| Import Teachers | ~349–416 | Auto-import from sessions |
| Loading State | ~418 | PageLoader |
| Header | ~426–440 | Title bar |
| Stats Grid | ~443–462 | KPI cards |
| Action Bar | ~465–531 | Search, date filter, buttons |
| Invoice Form | ~535–636 | Add/edit form |
| Invoice Table | ~639–723 | Data table |
| Confirm Modal | ~726–733 | Delete confirmation |

### Recommended Extractions
1. **`teacher-invoices/components/InvoiceUI.tsx`** — Reusable styled components
2. **`teacher-invoices/components/InvoiceForm.tsx`** — Add/edit form
3. **`teacher-invoices/components/InvoiceTable.tsx`** — Data table
4. **`teacher-invoices/components/InvoiceStats.tsx`** — Stats KPI grid

---

## 6. `src/pages/Leads.tsx` — **633 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Reusable UI Components | ~31–74 | SectionCard, PrimaryBtn, StatItem |
| ConfirmDeleteModal | ~77–111 | Delete confirmation modal |
| Main Component State & Setup | ~113–131 | State, query client |
| Data Fetching | ~123–131 | useQuery for leads + stats |
| Real-time Sync | ~134–148 | WebSocket listener |
| Mutations | ~151–180 | Add, Update, Delete mutations |
| Filtered Leads & Handlers | ~182–203 | Filter logic + handlers |
| Status Config | ~196–203 | Label/color mapping |
| Loading State | ~205–207 | PageLoader |
| Header | ~214–244 | Title bar |
| Quick Stats Bar | ~247–272 | KPI stat items |
| Filters & Search | ~275–303 | Search + status filter |
| Desktop Table | ~308–428 | Leads data table |
| Mobile Cards | ~431–555 | Mobile lead cards |
| Add Lead Modal | ~558–621 | Add lead form modal |
| Confirm Delete Modal | ~624–629 | Delete dialog |

### Recommended Extractions
1. **`leads/components/LeadsUI.tsx`** — SectionCard, PrimaryBtn, StatItem
2. **`leads/components/LeadTable.tsx`** — Desktop table
3. **`leads/components/LeadCards.tsx`** — Mobile cards
4. **`leads/components/AddLeadModal.tsx`** — Add lead form
5. **`leads/components/ConfirmDeleteModal.tsx`** — Delete confirmation

---

## 7. `src/pages/ParentStudents.tsx` — **579 lines**

### Logical Sections
| Section | Lines | Description |
|---|---|---|
| Main Component State & Setup | ~25–44 | State, dates |
| Data Fetching | ~46–71 | Fetch children + sessions |
| View Handlers | ~73–98 | View dates, attendance, achievements |
| Filtered Students | ~100–102 | Search filter |
| Loading State | ~104–106 | PageLoader |
| Page Header | ~111–127 | Title + search |
| Student Cards Grid | ~129–285 | Card per student with enrollments |
| Session Dates Modal | ~288–466 | Drill-down session timeline |
| Attendance Report Modal | ~469–575 | Per-subject attendance breakdown |

### Recommended Extractions
1. **`parent-students/components/StudentCard.tsx`** — Individual student card
2. **`parent-students/components/SessionsModal.tsx`** — Session dates drill-down
3. **`parent-students/components/AttendanceModal.tsx`** — Attendance breakdown
4. **`parent-students/components/AchievementSection.tsx`** — Gamification harvest

---

## Priority Order for Splitting

| Priority | File | Lines | Reason |
|---|---|---|---|
| **P0** | `SettingsPage.tsx` | 1338 | Largest file, 18+ distinct sections, heavily duplicated UI |
| **P1** | `MonthlyClosing.tsx` | 823 | 7 complex tabs, embedded modal, heavy business logic |
| **P2** | `StudentInvoices.tsx` | 770 | Form + table + import logic, reusable UI duplicated |
| **P3** | `TeacherInvoices.tsx` | 737 | Similar structure to StudentInvoices |
| **P4** | `Home.tsx` | 740 | Mostly presentational, but large Hero section can be extracted |
| **P5** | `Leads.tsx` | 633 | Table + mobile cards + modals, mutations cleanly separate |
| **P6** | `ParentStudents.tsx` | 579 | Modals are the main extraction candidates |

### Strategy
1. **First**, extract the duplicated styled components into a shared `ui/` module (SectionCard, SectionTitle, buttons, inputs) — this reduces every file by ~50–100 lines.
2. **Then** tackle files in priority order, extracting one component/tab at a time, verifying no regressions after each extraction.
3. Each extracted component should own its own state/data-fetching where possible (or receive props from the parent page).
