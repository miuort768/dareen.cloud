import React, { useState } from 'react'
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

const COLOR_PRESETS = [
  '#000000', // Black
  '#1e293b', // Slate
  '#dc2626', // Red
  '#ea580c', // Orange
  '#16a34a', // Green
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
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

  const isAdvancedShape = [
    'diamond',
    'rightTriangle',
    'hexagon',
    'cylinder',
    'cube',
    'coordinatePlane',
  ].includes(tool)

  return (
    <header className="bg-surface/95 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 backdrop-blur-md">
      {/* Group 1: Core Action Tools */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
        <button
          type="button"
          onClick={() => setTool('select')}
          title="أداة التحديد والتحريك (V)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'select'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <MousePointer size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('pen')}
          title="قلم حر (P)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'pen'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Pen size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('highlighter')}
          title="قلم تمييز شفاف (H)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'highlighter'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Highlighter size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('eraser')}
          title="ممحاة العناصر (E)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'eraser'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Eraser size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('text')}
          title="أداة النصوص (T)"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'text'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Type size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Shapes Group */}
        <button
          type="button"
          onClick={() => setTool('line')}
          title="خط مستقيم"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'line'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('arrow')}
          title="سهم أحادي"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'arrow'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('doubleArrow')}
          title="سهم مزدوج"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'doubleArrow'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <MoveHorizontal size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('rect')}
          title="مستطيل / مربع"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'rect'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Square size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('ellipse')}
          title="دائرة / شكل بيضاوي"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'ellipse'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Circle size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('triangle')}
          title="مثلث"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'triangle'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Triangle size={18} />
        </button>

        <button
          type="button"
          onClick={() => setTool('star')}
          title="نجمة / شكل خاص"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            tool === 'star'
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Star size={18} />
        </button>

        {/* Extended Shapes Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShapesMenuOpen((v) => !v)}
            title="أشكال هندسية متقدمة"
            className={`flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold transition-all ${
              isAdvancedShape || shapesMenuOpen
                ? 'bg-primary text-on-primary shadow-elevation-1'
                : 'bg-surface text-muted hover:bg-hover hover:text-main'
            }`}
          >
            <Shapes size={16} />
            <span className="hidden sm:inline">أشكال هندسية</span>
            <ChevronDown
              size={14}
              className={shapesMenuOpen ? 'rotate-180 transition-transform' : ''}
            />
          </button>

          {shapesMenuOpen && (
            <div className="bg-surface/95 absolute start-0 top-full z-50 mt-1.5 flex w-48 flex-col gap-1 rounded-2xl border border-border p-2 shadow-elevation-4 backdrop-blur-xl animate-in fade-in zoom-in-95">
              <span className="px-2 py-1 text-[10px] font-black text-muted">
                أشكال هندسية ومحاور
              </span>

              <button
                type="button"
                onClick={() => {
                  setTool('rightTriangle')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'rightTriangle'
                    ? 'bg-primary text-on-primary'
                    : 'text-main hover:bg-hover'
                }`}
              >
                <Triangle size={15} className="rotate-90" />
                <span>مثلث قائم الزاوية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTool('diamond')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'diamond' ? 'bg-primary text-on-primary' : 'text-main hover:bg-hover'
                }`}
              >
                <div className="h-3 w-3 rotate-45 border-2 border-current" />
                <span>معيّن هندسي</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTool('hexagon')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'hexagon' ? 'bg-primary text-on-primary' : 'text-main hover:bg-hover'
                }`}
              >
                <Layers size={15} />
                <span>شكل سداسي</span>
              </button>

              <div className="bg-border/60 my-1 h-px" />
              <span className="px-2 py-1 text-[10px] font-black text-muted">
                مجسمات 3D ومحاور بيانية
              </span>

              <button
                type="button"
                onClick={() => {
                  setTool('cube')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'cube' ? 'bg-primary text-on-primary' : 'text-main hover:bg-hover'
                }`}
              >
                <Box size={15} />
                <span>مكعب / متوازي مستطيلات</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTool('cylinder')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'cylinder' ? 'bg-primary text-on-primary' : 'text-main hover:bg-hover'
                }`}
              >
                <div className="h-4 w-3 rounded-full border-2 border-current" />
                <span>أسطوانة هندسية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTool('coordinatePlane')
                  setShapesMenuOpen(false)
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  tool === 'coordinatePlane'
                    ? 'bg-primary text-on-primary'
                    : 'text-main hover:bg-hover'
                }`}
              >
                <Sparkles size={15} />
                <span>محور إحداثيات (X - Y)</span>
              </button>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Math & Ruler tools */}
        <button
          type="button"
          onClick={onOpenMathSymbols}
          title="رموز ومعادلات رياضية"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        >
          <Binary size={18} />
        </button>

        <button
          type="button"
          onClick={() => setRulerVisible((v) => !v)}
          title="مسطرة قياس تفاعلية"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            rulerVisible
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Compass size={18} />
        </button>

        <button
          type="button"
          onClick={() => setProtractorVisible((v) => !v)}
          title="منقلة هندسية تفاعلية"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            protractorVisible
              ? 'bg-primary text-on-primary shadow-elevation-1'
              : 'text-muted hover:bg-hover hover:text-main'
          }`}
        >
          <Circle size={16} />
        </button>

        {setSetSquareVisible && (
          <button
            type="button"
            onClick={() => setSetSquareVisible((v) => !v)}
            title="مثلث هندسي تفاعلي (Set Square)"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              setSquareVisible
                ? 'bg-primary text-on-primary shadow-elevation-1'
                : 'text-muted hover:bg-hover hover:text-main'
            }`}
          >
            <Triangle size={16} />
          </button>
        )}
      </div>

      {/* Group 2: Color, Stroke & Background properties */}
      <div className="flex items-center gap-2">
        {/* Color presets */}
        <div className="bg-surface-active/50 flex items-center gap-1 rounded-xl p-1">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full transition-transform ${
                color === c ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'hover:scale-110'
              }`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-5 w-5 cursor-pointer rounded-full border-none bg-transparent"
            title="لون مخصص"
          />
        </div>

        {/* Stroke thickness */}
        <select
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="h-9 rounded-xl border border-border bg-surface px-2 text-xs font-bold text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="سُمك الخط"
        >
          <option value={2}>رفيع (2px)</option>
          <option value={4}>متوسط (4px)</option>
          <option value={8}>عريض (8px)</option>
          <option value={16}>سميك جداً (16px)</option>
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
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-hover hover:text-main disabled:pointer-events-none disabled:opacity-30"
        >
          <Undo2 size={18} />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="إعادة (Ctrl+Y)"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-hover hover:text-main disabled:pointer-events-none disabled:opacity-30"
        >
          <Redo2 size={18} />
        </button>

        {hasSelected && (
          <button
            type="button"
            onClick={onDeleteSelected}
            title="حذف العنصر المحدد (Delete)"
            className="bg-error/10 hover:bg-error/20 flex h-9 w-9 items-center justify-center rounded-xl text-error transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={onClearPage}
          title="مسح محتوى الصفحة بالكامل"
          className="hover:bg-error/10 flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold text-error transition-colors"
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
              <span className="h-2 w-2 rounded-full bg-success" /> تم الحفظ
            </span>
          )}
          {saveStatus === 'offline' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-warning">
              <span className="h-2 w-2 rounded-full bg-warning" /> حفظ محلي (مؤقت)
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
          title="حفظ يدوي"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-on-primary shadow-elevation-1 transition-colors hover:bg-primary-hover"
        >
          <Save size={16} />
          <span className="hidden sm:inline">حفظ</span>
        </button>

        {/* Exports */}
        <button
          type="button"
          onClick={onExportPng}
          title="تصدير كصورة PNG"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-main transition-colors hover:bg-hover"
        >
          <Download size={16} />
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          title="تصدير كملف PDF"
          className="flex h-9 items-center gap-1 rounded-xl border border-border px-2 text-xs font-bold text-main transition-colors hover:bg-hover"
        >
          <FileText size={14} />
          <span className="hidden md:inline">PDF</span>
        </button>
      </div>
    </header>
  )
}
