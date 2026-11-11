import React, { useState, useRef, useEffect } from 'react'
import {
  MousePointer,
  Pen,
  Highlighter,
  Eraser,
  Type,
  Minus,
  ArrowRight,
  MoveHorizontal,
  Square,
  Circle,
  Triangle,
  Star,
  Binary,
  Trash2,
  Undo2,
  Redo2,
  Save,
  Download,
  FileText,
  Compass,
  ChevronDown,
  Shapes,
  Box,
  Layers,
  Sparkles,
  Palette,
  Check,
} from 'lucide-react'
import type { WhiteboardTool, BackgroundPattern, SaveStatus } from '../../types/whiteboard'

interface WhiteboardToolbarProps {
  tool: WhiteboardTool
  setTool: (t: WhiteboardTool) => void
  color: string
  setColor: (c: string) => void
  strokeWidth: number
  setStrokeWidth: (w: number) => void
  fillColor?: string
  setFillColor?: (c: string) => void
  background: BackgroundPattern
  setBackground: (b: BackgroundPattern) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onClearPage: () => void
  onDeleteSelected: () => void
  hasSelected: boolean
  saveStatus: SaveStatus
  onManualSave: () => void
  onExportPng: () => void
  onExportPdf: () => void
  onPrint?: () => void
  onOpenMathSymbols: () => void
  rulerVisible: boolean
  setRulerVisible: (v: boolean | ((v: boolean) => boolean)) => void
  protractorVisible: boolean
  setProtractorVisible: (v: boolean | ((v: boolean) => boolean)) => void
  setSquareVisible?: boolean
  setSetSquareVisible?: (v: boolean | ((v: boolean) => boolean)) => void
}

// 8 primary quick-pick colors
const QUICK_COLORS = [
  { hex: '#1e293b', label: 'أسود فحمي' },
  { hex: '#2563eb', label: 'أزرق ملكي' },
  { hex: '#dc2626', label: 'أحمر تنبيه' },
  { hex: '#16a34a', label: 'أخضر دراسي' },
  { hex: '#7c3aed', label: 'بنفسجي توضيحي' },
  { hex: '#ea580c', label: 'برتقالي مشرق' },
  { hex: '#eab308', label: 'أصفر تمييز' },
  { hex: '#ffffff', label: 'أبيض (للسبورة الداكنة)' },
]

// Expanded color palette categories
const PALETTE_GROUPS = [
  {
    name: 'ألوان كلاسيكية للشرح',
    colors: ['#0f172a', '#334155', '#1e40af', '#065f46', '#991b1b', '#86198f'],
  },
  {
    name: 'ألوان باستيل وهادئة',
    colors: ['#38bdf8', '#4ade80', '#f87171', '#fbbf24', '#c084fc', '#fb923c'],
  },
  {
    name: 'ألوان نيون وإضاءة',
    colors: ['#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'],
  },
]

// All geometric shapes definitions
const SHAPE_DEFINITIONS = [
  {
    category: 'خطوط ومحاور هندسية',
    items: [
      { id: 'line', label: 'خط مستقيم', icon: Minus },
      { id: 'arrow', label: 'سهم أحادي الاتجاه', icon: ArrowRight },
      { id: 'doubleArrow', label: 'سهم مزدوج الاتجاه', icon: MoveHorizontal },
      { id: 'coordinatePlane', label: 'شبكة محاور إحداثيات (X - Y)', icon: Sparkles },
    ],
  },
  {
    category: 'أشكال ثنائية الأبعاد (2D)',
    items: [
      { id: 'rect', label: 'مستطيل / مربع', icon: Square },
      { id: 'ellipse', label: 'دائرة / شكل بيضاوي', icon: Circle },
      { id: 'triangle', label: 'مثلث متساوي الأضلاع', icon: Triangle },
      { id: 'rightTriangle', label: 'مثلث قائم الزاوية', icon: Triangle, rotate: 'rotate-90' },
      { id: 'diamond', label: 'معيّن هندسي', icon: Square, rotate: 'rotate-45' },
      { id: 'hexagon', label: 'شكل سداسي منتظم', icon: Layers },
      { id: 'star', label: 'نجمة خماسية', icon: Star },
    ],
  },
  {
    category: 'مجسمات ثلاثية الأبعاد (3D)',
    items: [
      { id: 'cube', label: 'مكعب ثلاثي الأبعاد', icon: Box },
      { id: 'cylinder', label: 'أسطوانة دائرية 3D', icon: Box },
    ],
  },
]

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  background,
  setBackground,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearPage,
  onDeleteSelected,
  hasSelected,
  saveStatus,
  onManualSave,
  onExportPng,
  onExportPdf,
  onOpenMathSymbols,
  rulerVisible,
  setRulerVisible,
  protractorVisible,
  setProtractorVisible,
  setSquareVisible = false,
  setSetSquareVisible,
}) => {
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)

  const shapesMenuRef = useRef<HTMLDivElement>(null)
  const colorMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapesMenuRef.current && !shapesMenuRef.current.contains(e.target as Node)) {
        setShapesMenuOpen(false)
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setColorMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if active tool is any shape
  const allShapeIds = SHAPE_DEFINITIONS.flatMap((g) => g.items.map((i) => i.id))
  const isAnyShapeActive = allShapeIds.includes(tool)
  const currentShapeItem = SHAPE_DEFINITIONS.flatMap((g) => g.items).find((i) => i.id === tool)

  return (
    <header className="bg-surface/95 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 backdrop-blur-md">
      {/* Group 1: Core Action Tools */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Select Tool */}
        <button
          type="button"
          onClick={() => setTool('select')}
          title="أداة التحديد والتحريك (V)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'select'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <MousePointer size={18} />
        </button>

        {/* Free Pen */}
        <button
          type="button"
          onClick={() => setTool('pen')}
          title="قلم حر للشرح (P)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'pen'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Pen size={18} />
        </button>

        {/* Highlighter */}
        <button
          type="button"
          onClick={() => setTool('highlighter')}
          title="قلم تمييز شفاف (H)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'highlighter'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Highlighter size={18} />
        </button>

        {/* Eraser */}
        <button
          type="button"
          onClick={() => setTool('eraser')}
          title="ممحاة العناصر (E)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'eraser'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Eraser size={18} />
        </button>

        {/* Text */}
        <button
          type="button"
          onClick={() => setTool('text')}
          title="أداة إضافة النصوص (T)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'text'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Type size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Quick Shape Shortcuts: Line & Rect */}
        <button
          type="button"
          onClick={() => setTool('line')}
          title="خط مستقيم"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'line'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('rect')}
          title="مستطيل / مربع"
          className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            tool === 'rect'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Square size={17} />
        </button>

        {/* Master Geometric Shapes Button & Dropdown */}
        <div className="relative" ref={shapesMenuRef}>
          <button
            type="button"
            onClick={() => setShapesMenuOpen((v) => !v)}
            title="الأشكال الهندسية والمجسمات ثلاثية الأبعاد"
            aria-expanded={shapesMenuOpen}
            className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
              isAnyShapeActive || shapesMenuOpen
                ? 'bg-primary text-on-primary shadow-elevation-1'
                : 'border border-border bg-surface text-main hover:bg-hover'
            }`}
          >
            {currentShapeItem ? (
              <currentShapeItem.icon size={16} className={currentShapeItem.rotate || ''} />
            ) : (
              <Shapes size={16} />
            )}
            <span>{currentShapeItem ? currentShapeItem.label : 'الأشكال الهندسية'}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${shapesMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Full Shapes Menu Panel */}
          {shapesMenuOpen && (
            <div className="absolute start-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 shadow-elevation-4 duration-150 animate-in fade-in zoom-in-95">
              <div className="space-y-3">
                {SHAPE_DEFINITIONS.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <span className="block px-2 text-[10px] font-black uppercase tracking-wider text-muted">
                      {group.category}
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isSelected = tool === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setTool(item.id as WhiteboardTool)
                              setShapesMenuOpen(false)
                            }}
                            className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-start text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
                              isSelected ? 'bg-primary text-on-primary' : 'text-main hover:bg-hover'
                            }`}
                          >
                            <Icon size={15} className={`shrink-0 ${item.rotate || ''}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Math Symbols Modal Trigger */}
        <button
          type="button"
          onClick={onOpenMathSymbols}
          title="رموز ومعادلات رياضية"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary outline-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Binary size={18} />
        </button>

        {/* Interactive Ruler (المسطرة) */}
        <button
          type="button"
          onClick={() => setRulerVisible((v) => !v)}
          title="مسطرة قياس تفاعلية (30 سم)"
          className={`flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            rulerVisible
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Minus size={16} className="rotate-45" />
          <span className="hidden md:inline">مسطرة</span>
        </button>

        {/* Interactive Protractor / Compass (البرجل / المنقلة) */}
        <button
          type="button"
          onClick={() => setProtractorVisible((v) => !v)}
          title="منقلة وبرجل قياس زوايا تفاعلي"
          className={`flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
            protractorVisible
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Compass size={16} />
          <span className="hidden md:inline">برجل ومنقلة</span>
        </button>

        {/* Interactive Set Square (المثلث الهندسي) */}
        {setSetSquareVisible && (
          <button
            type="button"
            onClick={() => setSetSquareVisible((v) => !v)}
            title="مثلث هندسي وكوس تفاعلي"
            className={`flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
              setSquareVisible
                ? 'bg-primary text-on-primary shadow-elevation-1'
                : 'text-muted hover:bg-hover hover:text-main'
            }`}
          >
            <Triangle size={15} />
            <span className="hidden md:inline">مثلث</span>
          </button>
        )}
      </div>

      {/* Group 2: Color, Stroke & Background properties */}
      <div className="flex items-center gap-2">
        {/* Enhanced Color Picker Section */}
        <div className="bg-surface-active/30 flex items-center gap-1.5 rounded-2xl border border-border p-1">
          {/* Quick Swatches */}
          <div className="flex items-center gap-1">
            {QUICK_COLORS.map((c) => {
              const isSelected = color.toLowerCase() === c.hex.toLowerCase()
              const isWhite = c.hex.toLowerCase() === '#ffffff'
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.label}
                  style={{ backgroundColor: c.hex }}
                  className={`relative h-6 w-6 rounded-full outline-none transition-transform ${
                    isWhite ? 'border-border/80 border' : ''
                  } ${
                    isSelected
                      ? 'scale-110 shadow-elevation-1 ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : 'hover:scale-110'
                  }`}
                >
                  {isSelected && (
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-[10px] ${
                        isWhite ? 'text-black' : 'text-white'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Color Palette Popover Trigger */}
          <div className="relative" ref={colorMenuRef}>
            <button
              type="button"
              onClick={() => setColorMenuOpen((v) => !v)}
              title="لوحة ألوان إضافية ومخصص"
              aria-expanded={colorMenuOpen}
              className={`flex h-6 items-center gap-1 rounded-lg border border-border px-1.5 text-[10px] font-black transition-colors ${
                colorMenuOpen ? 'bg-primary text-on-primary' : 'bg-surface text-main hover:bg-hover'
              }`}
            >
              <Palette size={12} />
              <span className="hidden lg:inline">المزيد</span>
            </button>

            {/* Expanded Color Popover */}
            {colorMenuOpen && (
              <div className="absolute end-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-surface p-3 shadow-elevation-4 duration-150 animate-in fade-in zoom-in-95">
                <div className="space-y-3">
                  <div className="border-border/60 flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-black text-main">لوحة ألوان القلم</span>
                    {/* Live stroke preview */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">معاينة:</span>
                      <div className="h-3 w-10 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>

                  {/* Grouped Colors */}
                  {PALETTE_GROUPS.map((group) => (
                    <div key={group.name} className="space-y-1">
                      <span className="block text-[10px] font-bold text-muted">{group.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {group.colors.map((hex) => {
                          const isSelected = color.toLowerCase() === hex.toLowerCase()
                          return (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => {
                                setColor(hex)
                                setColorMenuOpen(false)
                              }}
                              style={{ backgroundColor: hex }}
                              className={`h-6 w-6 rounded-lg transition-transform ${
                                isSelected
                                  ? 'scale-110 ring-2 ring-primary ring-offset-1'
                                  : 'hover:scale-110'
                              }`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Custom Color Input */}
                  <div className="border-border/60 flex items-center justify-between border-t pt-2">
                    <span className="text-[11px] font-bold text-main">لون مخصص بالكامل:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded-lg border border-border bg-transparent p-0"
                      />
                      <span className="font-mono text-[10px] font-bold uppercase text-muted">
                        {color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stroke thickness */}
        <select
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="h-9 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="سُمك خط القلم"
        >
          <option value={2}>خط رفيع (2px)</option>
          <option value={4}>خط متوسط (4px)</option>
          <option value={8}>خط عريض (8px)</option>
          <option value={14}>خط سميك جداً (14px)</option>
        </select>

        {/* Background picker */}
        <select
          value={background}
          onChange={(e) => setBackground(e.target.value as BackgroundPattern)}
          className="h-9 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="خلفية السبورة"
        >
          <option value="white">⚪ خلفية بيضاء</option>
          <option value="black">⚫ سبورة سوداء</option>
          <option value="grid">📐 شبكة إحداثيات</option>
          <option value="ruled">📝 دفتر مسطر</option>
          <option value="dots">⠶ نقاط هندسية</option>
        </select>
      </div>

      {/* Group 3: History & Persistence Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="تراجع (Ctrl+Z)"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted outline-none transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-30"
        >
          <Undo2 size={18} />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="إعادة (Ctrl+Y)"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted outline-none transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-30"
        >
          <Redo2 size={18} />
        </button>

        {hasSelected && (
          <button
            type="button"
            onClick={onDeleteSelected}
            title="حذف العنصر المحدد (Delete)"
            className="bg-error/10 hover:bg-error/20 flex h-9 w-9 items-center justify-center rounded-xl text-error outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={onClearPage}
          title="مسح محتوى الصفحة بالكامل"
          className="hover:bg-error/10 flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold text-error outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">مسح الصفحة</span>
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Save Status Badge & Manual Save */}
        <div className="flex items-center gap-1.5 px-2">
          {saveStatus === 'saving' && (
            <span className="flex animate-pulse items-center gap-1 text-[11px] font-bold text-muted">
              <span className="h-2 w-2 rounded-full bg-primary" /> جارٍ الحفظ...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-success">
              <span className="h-2 w-2 rounded-full bg-success" /> تم الحفظ في المتصفح
            </span>
          )}
          {saveStatus === 'offline' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-success">
              <span className="h-2 w-2 rounded-full bg-success" /> حفظ محلي (المتصفح)
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-error">
              <span className="h-2 w-2 rounded-full bg-error" /> تعذر الحفظ
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onManualSave}
          title="حفظ السبورة في المتصفح"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-on-primary shadow-elevation-1 outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Save size={16} />
          <span className="hidden sm:inline">حفظ</span>
        </button>

        {/* Exports */}
        <button
          type="button"
          onClick={onExportPng}
          title="تصدير كصورة PNG"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Download size={16} />
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          title="تصدير كملف PDF"
          className="flex h-9 items-center gap-1 rounded-xl border border-border px-2 text-xs font-bold text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
        >
          <FileText size={14} />
          <span className="hidden md:inline">PDF</span>
        </button>
      </div>
    </header>
  )
}
