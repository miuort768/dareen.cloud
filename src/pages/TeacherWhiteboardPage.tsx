import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FolderOpen, ChevronLeft, ChevronRight, Plus, FileEdit } from 'lucide-react'
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
import { InteractiveRuler, InteractiveProtractor } from '../components/whiteboard/MathToolsOverlay'
import {
  exportCurrentPageAsPng,
  exportAllPagesAsPdf,
  printWhiteboard,
  generateThumbnail,
} from '../components/whiteboard/exportUtils'
import { whiteboardApiService } from '../services/whiteboardService'
import { whiteboardStorage } from '../services/whiteboardStorage'
import { confirm } from '../lib/confirmDialog'

export const TeacherWhiteboardPage: React.FC = () => {
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

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedJsonRef = useRef<string>('')

  // Board list & drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [savedBoards, setSavedBoards] = useState<Array<Omit<WhiteboardItem, 'pagesData'>>>([])
  const [boardsLoading, setBoardsLoading] = useState(false)

  const activePage = pages[activePageIndex] || pages[0]

  // Fetch boards list on mount
  const refreshBoardsList = useCallback(async () => {
    try {
      setBoardsLoading(true)
      const list = await whiteboardApiService.list()
      setSavedBoards(list)
    } catch (e) {
      console.warn('Failed to load boards from server, loading local cache', e)
      const local = await whiteboardStorage.listLocalBoards()
      setSavedBoards(local.map((b) => ({ id: b.id, title: b.title, updatedAt: b.updatedAt })))
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

  // Save logic (Local + Remote API)
  const saveBoard = useCallback(
    async (isManual = false) => {
      const currentJson = JSON.stringify({ boardTitle, pages })
      if (!isManual && currentJson === lastSavedJsonRef.current) {
        return
      }

      setSaveStatus('saving')
      const thumb = generateThumbnail(pages[0] || activePage)

      const payload: WhiteboardItem = {
        id: boardId || '',
        title: boardTitle,
        pagesData: pages,
        thumbnail: thumb,
        updatedAt: new Date().toISOString(),
      }

      // 1. Always save to local IndexedDB for zero data loss
      await whiteboardStorage.saveLocalDraft(payload)

      // 2. Sync to Server
      try {
        if (boardId) {
          await whiteboardApiService.update(boardId, payload)
        } else {
          const created = await whiteboardApiService.create(payload)
          setBoardId(created.id)
          payload.id = created.id
          await whiteboardStorage.saveLocalDraft(payload)
        }
        setSaveStatus('saved')
        lastSavedJsonRef.current = currentJson
        refreshBoardsList()
      } catch (e) {
        console.warn('Network sync failed, saved in local IndexedDB only', e)
        setSaveStatus('offline')
      }
    },
    [boardId, boardTitle, pages, activePage, refreshBoardsList],
  )

  // Debounced autosave
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveBoard(false)
    }, 3000)

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [pages, boardTitle, saveBoard])

  // Open existing board
  const handleSelectBoard = async (id: string) => {
    try {
      setSaveStatus('saving')
      const board = await whiteboardApiService.getById(id)
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

  // Create new blank board
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

  // Duplicate board from drawer
  const handleDuplicateBoard = async (id: string) => {
    try {
      await whiteboardApiService.duplicate(id)
      refreshBoardsList()
    } catch (e) {
      console.error('Failed to duplicate board', e)
    }
  }

  // Delete board
  const handleDeleteBoard = async (id: string) => {
    const ok = await confirm({
      title: 'حذف السبورة بالكامل',
      message: 'هل أنتِ متأكدة من حذف هذه السبورة نهائياً؟',
      confirmText: 'حذف نهائي',
      cancelText: 'إلغاء',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await whiteboardApiService.delete(id)
      await whiteboardStorage.deleteLocalBoard(id)
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

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-main">
      {/* Top Banner: Board Title & Navigation Hub */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-main shadow-elevation-1 transition-colors hover:bg-hover"
          >
            <FolderOpen size={15} className="text-primary" />
            <span>السبورات المحفوظة</span>
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
                title="انقري لتعديل الاسم"
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

        {/* Page Switcher for Mobile / Compact */}
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

        {/* Floating Ruler and Protractor overlays */}
        <InteractiveRuler visible={rulerVisible} onClose={() => setRulerVisible(false)} />
        <InteractiveProtractor
          visible={protractorVisible}
          onClose={() => setProtractorVisible(false)}
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

      {/* Saved Whiteboards Manager Drawer */}
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
