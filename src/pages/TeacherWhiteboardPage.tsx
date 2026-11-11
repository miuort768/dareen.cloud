import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileEdit,
  Monitor,
  Tablet,
  Laptop,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type {
  WhiteboardTool,
  BackgroundPattern,
  WhiteboardItem,
  WhiteboardPage,
  WhiteboardElement,
  SaveStatus,
  TextElement,
} from '../types/whiteboard'
import { WhiteboardToolbar } from '../components/whiteboard/WhiteboardToolbar'
import { WhiteboardCanvas } from '../components/whiteboard/WhiteboardCanvas'
import { PageThumbnails } from '../components/whiteboard/PageThumbnails'
import { MathSymbolsModal } from '../components/whiteboard/MathSymbolsModal'
import { WhiteboardManagerDrawer } from '../components/whiteboard/WhiteboardManagerDrawer'
import {
  InteractiveRuler,
  InteractiveProtractor,
  InteractiveSetSquare,
} from '../components/whiteboard/MathToolsOverlay'
import {
  exportCurrentPageAsPng,
  exportAllPagesAsPdf,
  printWhiteboard,
  generateThumbnail,
} from '../components/whiteboard/exportUtils'
import { whiteboardStorage } from '../services/whiteboardStorage'
import { confirm } from '../lib/confirmDialog'

export const TeacherWhiteboardPage: React.FC = () => {
  const navigate = useNavigate()

  // Screen responsiveness: Phones (< 768px) vs Tablets, Laptops & Desktops (>= 768px)
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false
  })
  const [overrideMobileNotice, setOverrideMobileNotice] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Active board state
  const [boardId, setBoardId] = useState<string | null>(null)
  const [boardTitle, setBoardTitle] = useState('سبورة تفاعلية جديدة')
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  // Pages state
  const [pages, setPages] = useState<WhiteboardPage[]>([
    {
      id: `page_${Date.now()}`,
      background: 'white',
      elements: [],
    },
  ])
  const [activePageIndex, setActivePageIndex] = useState(0)

  // Tool state
  const [tool, setTool] = useState<WhiteboardTool>('pen')
  const [color, setColor] = useState('#1e293b')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [fillColor, setFillColor] = useState('transparent')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // Undo / Redo history for current page
  const [history, setHistory] = useState<WhiteboardElement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Math overlays
  const [isMathModalOpen, setIsMathModalOpen] = useState(false)
  const [rulerVisible, setRulerVisible] = useState(false)
  const [protractorVisible, setProtractorVisible] = useState(false)
  const [setSquareVisible, setSetSquareVisible] = useState(false)

  // Save state (100% browser-based via IndexedDB & localStorage)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedJsonRef = useRef<string>('')

  // Board list & centered modal
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [savedBoards, setSavedBoards] = useState<Array<Omit<WhiteboardItem, 'pagesData'>>>([])
  const [boardsLoading, setBoardsLoading] = useState(false)

  const activePage = pages[activePageIndex] || pages[0]

  // Fetch boards list directly from browser storage
  const refreshBoardsList = useCallback(async () => {
    try {
      setBoardsLoading(true)
      const list = await whiteboardStorage.listBoards()
      setSavedBoards(list)
    } catch (e) {
      console.warn('Failed to load boards from browser storage', e)
    } finally {
      setBoardsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshBoardsList()
  }, [refreshBoardsList])

  // Restore draft or initialize
  useEffect(() => {
    whiteboardStorage.getLocalDraft().then((draft) => {
      if (draft && draft.pagesData && draft.pagesData.length > 0) {
        setBoardId(draft.id || null)
        setBoardTitle(draft.title || 'سبورة تفاعلية جديدة')
        setPages(draft.pagesData)
        setHistory([draft.pagesData[0]?.elements || []])
        setHistoryIndex(0)
      }
    })
  }, [])

  // Sync current page elements with history
  const handleElementsChange = (newElements: WhiteboardElement[]) => {
    const newPages = [...pages]
    newPages[activePageIndex] = {
      ...newPages[activePageIndex],
      elements: newElements,
    }
    setPages(newPages)

    // Append to history
    const sliced = history.slice(0, historyIndex + 1)
    setHistory([...sliced, newElements])
    setHistoryIndex(sliced.length)
  }

  // Undo / Redo
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = () => {
    if (!canUndo) return
    const prevElements = history[historyIndex - 1]
    setHistoryIndex((i) => i - 1)
    const newPages = [...pages]
    newPages[activePageIndex] = {
      ...newPages[activePageIndex],
      elements: prevElements,
    }
    setPages(newPages)
  }

  const handleRedo = () => {
    if (!canRedo) return
    const nextElements = history[historyIndex + 1]
    setHistoryIndex((i) => i + 1)
    const newPages = [...pages]
    newPages[activePageIndex] = {
      ...newPages[activePageIndex],
      elements: nextElements,
    }
    setPages(newPages)
  }

  // Clear current page elements
  const handleClearPage = async () => {
    const ok = await confirm({
      title: 'مسح محتوى الصفحة',
      message: 'هل أنتِ متأكدة من رغبتك في مسح كل عناصر هذه الصفحة؟ لا يمكن التراجع عن هذه الخطوة.',
      confirmText: 'مسح الآن',
      cancelText: 'إلغاء',
      variant: 'danger',
    })
    if (ok) {
      handleElementsChange([])
      setSelectedElementId(null)
    }
  }

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedElementId) return
    const remaining = activePage.elements.filter((el) => el.id !== selectedElementId)
    handleElementsChange(remaining)
    setSelectedElementId(null)
  }

  // Change background pattern of active page
  const handleBackgroundChange = (bg: BackgroundPattern) => {
    const newPages = [...pages]
    newPages[activePageIndex] = {
      ...newPages[activePageIndex],
      background: bg,
    }
    setPages(newPages)
  }

  // Page navigation & operations
  const handleAddPage = () => {
    const newPage: WhiteboardPage = {
      id: `page_${Date.now()}`,
      background: 'white',
      elements: [],
    }
    setPages([...pages, newPage])
    setActivePageIndex(pages.length)
    setHistory([[]])
    setHistoryIndex(0)
    setSelectedElementId(null)
  }

  const handleDeletePage = async (index: number) => {
    if (pages.length <= 1) return
    const ok = await confirm({
      title: 'حذف الصفحة',
      message: `هل أنتِ متأكدة من حذف الصفحة #${index + 1}؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      variant: 'danger',
    })
    if (!ok) return

    const newPages = pages.filter((_, i) => i !== index)
    setPages(newPages)
    const nextIndex = Math.min(activePageIndex, newPages.length - 1)
    setActivePageIndex(nextIndex)
    setHistory([newPages[nextIndex].elements])
    setHistoryIndex(0)
    setSelectedElementId(null)
  }

  const handleDuplicatePage = (index: number) => {
    const target = pages[index]
    const dup: WhiteboardPage = {
      ...target,
      id: `page_${Date.now()}`,
      elements: JSON.parse(JSON.stringify(target.elements)),
    }
    const newPages = [...pages]
    newPages.splice(index + 1, 0, dup)
    setPages(newPages)
    setActivePageIndex(index + 1)
    setHistory([dup.elements])
    setHistoryIndex(0)
  }

  // Insert math symbol
  const handleInsertMathSymbol = (sym: string) => {
    const newText: TextElement = {
      id: `math_${Date.now()}`,
      type: 'math',
      x: 300,
      y: 200,
      text: sym,
      fontSize: 28,
      strokeColor: color,
      strokeWidth: 2,
    }
    handleElementsChange([...activePage.elements, newText])
  }

  // 100% Client-Side Browser Save Logic
  const saveBoard = useCallback(
    async (isManual = false) => {
      const currentJson = JSON.stringify({ boardTitle, pages })
      if (!isManual && currentJson === lastSavedJsonRef.current) {
        return
      }

      setSaveStatus('saving')
      const thumb = generateThumbnail(pages[0] || activePage)

      const payload: Partial<WhiteboardItem> = {
        id: boardId || undefined,
        title: boardTitle,
        pagesData: pages,
        thumbnail: thumb,
        updatedAt: new Date().toISOString(),
      }

      try {
        // Save in browser IndexedDB & localStorage
        const saved = await whiteboardStorage.saveBoard(payload)
        setBoardId(saved.id)
        setSaveStatus('saved')
        lastSavedJsonRef.current = currentJson
        refreshBoardsList()
      } catch (err) {
        console.error('Failed to save to browser storage', err)
        setSaveStatus('error')
      }
    },
    [boardId, boardTitle, pages, activePage, refreshBoardsList],
  )

  // Debounced autosave in browser
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveBoard(false)
    }, 2500)

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [pages, boardTitle, saveBoard])

  // Open existing board from browser storage
  const handleSelectBoard = async (id: string) => {
    try {
      setSaveStatus('saving')
      const board = await whiteboardStorage.getBoardById(id)
      if (!board) {
        throw new Error('السبورة غير موجودة')
      }
      setBoardId(board.id)
      setBoardTitle(board.title)
      setPages(
        board.pagesData && board.pagesData.length > 0
          ? board.pagesData
          : [
              {
                id: `page_${Date.now()}`,
                background: 'white',
                elements: [],
              },
            ],
      )
      setActivePageIndex(0)
      setHistory([board.pagesData?.[0]?.elements || []])
      setHistoryIndex(0)
      setSelectedElementId(null)
      setSaveStatus('saved')
    } catch (e) {
      console.error('Failed to load board', e)
      setSaveStatus('error')
    }
  }

  // Create new blank board in browser
  const handleCreateNewBoard = async () => {
    setBoardId(null)
    setBoardTitle('سبورة تفاعلية جديدة')
    const initialPages: WhiteboardPage[] = [
      {
        id: `page_${Date.now()}`,
        background: 'white',
        elements: [],
      },
    ]
    setPages(initialPages)
    setActivePageIndex(0)
    setHistory([[]])
    setHistoryIndex(0)
    setSelectedElementId(null)
    await whiteboardStorage.clearActiveDraft()
    setSaveStatus('idle')
  }

  // Duplicate board from modal
  const handleDuplicateBoard = async (id: string) => {
    try {
      await whiteboardStorage.duplicateBoard(id)
      refreshBoardsList()
    } catch (e) {
      console.error('Failed to duplicate board', e)
    }
  }

  // Delete board from browser
  const handleDeleteBoard = async (id: string) => {
    const ok = await confirm({
      title: 'حذف السبورة بالكامل',
      message: 'هل أنتِ متأكدة من حذف هذه السبورة نهائياً من المتصفح؟',
      confirmText: 'حذف نهائي',
      cancelText: 'إلغاء',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await whiteboardStorage.deleteBoard(id)
      if (boardId === id) {
        handleCreateNewBoard()
      }
      refreshBoardsList()
    } catch (e) {
      console.error('Failed to delete board', e)
    }
  }

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault()
          handleDeleteSelected()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // --------------------------------------------------------------------------
  // Mobile Phone Guard View (< 768px): Friendly notice
  // --------------------------------------------------------------------------
  if (isMobileScreen && !overrideMobileNotice) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-main">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 text-center shadow-elevation-4 duration-300 animate-in fade-in">
          {/* Visual Device Badges */}
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Tablet size={34} className="stroke-[1.7]" />
            <span className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-on-primary shadow-elevation-2">
              <Laptop size={14} />
            </span>
          </div>

          {/* Heading */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <Sparkles size={13} />
            <span>عزيزي شريك النجاح</span>
          </div>

          <h1 className="text-lg font-black text-main">
            السبورة التفاعلية متاحة على الشاشات الكبيرة
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            السبورة متاح علي الشاشات الكبيرة لسهولة الاستخدام والتفاعل الأمثل. للحصول على أفضل تجربة
            شرح ورسم دقيق، يُرجى فتح السبورة من:
          </p>

          {/* Supported Devices Cards */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-start">
            <div className="border-border/80 bg-surface-active/20 flex flex-col items-center justify-center rounded-2xl border p-3 text-center">
              <Tablet size={20} className="mb-1.5 text-primary" />
              <span className="text-[11px] font-bold text-main">التابلت والآيباد</span>
              <span className="text-[9px] text-muted">لمس ودعم القلم</span>
            </div>

            <div className="border-border/80 bg-surface-active/20 flex flex-col items-center justify-center rounded-2xl border p-3 text-center">
              <Laptop size={20} className="mb-1.5 text-primary" />
              <span className="text-[11px] font-bold text-main">اللابتوب</span>
              <span className="text-[9px] text-muted">تحكم سهل بالماوس</span>
            </div>

            <div className="border-border/80 bg-surface-active/20 flex flex-col items-center justify-center rounded-2xl border p-3 text-center">
              <Monitor size={20} className="mb-1.5 text-primary" />
              <span className="text-[11px] font-bold text-main">الكمبيوتر</span>
              <span className="text-[9px] text-muted">مساحة عمل واسعة</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-black text-on-primary shadow-elevation-2 outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ArrowRight size={16} />
              <span>العودة إلى لوحة المعلم</span>
            </button>

            <button
              type="button"
              onClick={() => setOverrideMobileNotice(true)}
              className="py-1 text-[11px] font-bold text-muted transition-colors hover:text-main"
            >
              متابعة وعرض السبورة على الهاتف على أي حال
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // Main Whiteboard Workspace (Tablets, Laptops & Desktops)
  // --------------------------------------------------------------------------
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-main">
      {/* Top Banner: Board Title, Centered Modal Trigger & Page Switcher */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Centered Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            title="فتح نافذة السبورات المحفوظة بالمتصفح"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-black text-main shadow-elevation-1 outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
          >
            <FolderOpen size={16} className="text-primary" />
            <span>السبورات المحفوظة</span>
            {savedBoards.length > 0 && (
              <span className="py-0.2 rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                {savedBoards.length}
              </span>
            )}
          </button>

          {/* Editable Board Title */}
          <div className="flex items-center gap-1.5">
            {isEditingTitle ? (
              <input
                type="text"
                value={boardTitle}
                autoFocus
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="rounded-lg border border-primary bg-surface px-2 py-1 text-sm font-black text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-hover"
                title="انقري لتعديل اسم السبورة"
              >
                <h1 className="text-sm font-black text-main">{boardTitle}</h1>
                <FileEdit
                  size={13}
                  className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-2 py-1">
            <button
              type="button"
              disabled={activePageIndex === 0}
              onClick={() => {
                const prev = activePageIndex - 1
                setActivePageIndex(prev)
                setHistory([pages[prev].elements])
                setHistoryIndex(0)
                setSelectedElementId(null)
              }}
              className="p-1 text-muted hover:text-main disabled:opacity-30"
              title="الصفحة السابقة"
            >
              <ChevronRight size={16} />
            </button>
            <span className="font-mono text-xs font-bold text-main">
              {activePageIndex + 1} / {pages.length}
            </span>
            <button
              type="button"
              disabled={activePageIndex === pages.length - 1}
              onClick={() => {
                const next = activePageIndex + 1
                setActivePageIndex(next)
                setHistory([pages[next].elements])
                setHistoryIndex(0)
                setSelectedElementId(null)
              }}
              className="p-1 text-muted hover:text-main disabled:opacity-30"
              title="الصفحة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddPage}
            className="flex items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">صفحة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <WhiteboardToolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        fillColor={fillColor}
        setFillColor={setFillColor}
        background={activePage.background}
        setBackground={handleBackgroundChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClearPage={handleClearPage}
        onDeleteSelected={handleDeleteSelected}
        hasSelected={Boolean(selectedElementId)}
        saveStatus={saveStatus}
        onManualSave={() => saveBoard(true)}
        onExportPng={() =>
          exportCurrentPageAsPng(
            activePage,
            1920,
            1080,
            `${boardTitle}-صفحة-${activePageIndex + 1}.png`,
          )
        }
        onExportPdf={() => exportAllPagesAsPdf(pages, `${boardTitle}.pdf`)}
        onPrint={() => printWhiteboard(activePage, 1920, 1080)}
        onOpenMathSymbols={() => setIsMathModalOpen(true)}
        rulerVisible={rulerVisible}
        setRulerVisible={setRulerVisible}
        protractorVisible={protractorVisible}
        setProtractorVisible={setProtractorVisible}
        setSquareVisible={setSquareVisible}
        setSetSquareVisible={setSetSquareVisible}
      />

      {/* Canvas Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden">
        <WhiteboardCanvas
          page={activePage}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          fillColor={fillColor}
          onElementsChange={handleElementsChange}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
        />

        {/* Floating Centered Ruler, Protractor and Set Square overlays */}
        <InteractiveRuler visible={rulerVisible} onClose={() => setRulerVisible(false)} />
        <InteractiveProtractor
          visible={protractorVisible}
          onClose={() => setProtractorVisible(false)}
        />
        <InteractiveSetSquare
          visible={setSquareVisible}
          onClose={() => setSetSquareVisible(false)}
        />

        {/* Desktop Sidebar: Page Thumbnails */}
        <PageThumbnails
          pages={pages}
          activePageIndex={activePageIndex}
          onSelectPage={(idx) => {
            setActivePageIndex(idx)
            setHistory([pages[idx].elements])
            setHistoryIndex(0)
            setSelectedElementId(null)
          }}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
        />
      </div>

      {/* Math Symbols Modal */}
      <MathSymbolsModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsertSymbol={handleInsertMathSymbol}
      />

      {/* Centered Modal: Saved Whiteboards Manager */}
      <WhiteboardManagerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        whiteboards={savedBoards}
        activeBoardId={boardId}
        onSelectBoard={handleSelectBoard}
        onCreateNew={handleCreateNewBoard}
        onDeleteBoard={handleDeleteBoard}
        onDuplicateBoard={handleDuplicateBoard}
        loading={boardsLoading}
      />
    </div>
  )
}

export default TeacherWhiteboardPage
