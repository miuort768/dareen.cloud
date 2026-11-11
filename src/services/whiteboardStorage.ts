import { get, set, del, keys } from 'idb-keyval'
import type { WhiteboardItem } from '../types/whiteboard'

const IDB_PREFIX = 'dareen_whiteboard_'
const ACTIVE_DRAFT_KEY = 'dareen_whiteboard_active_draft'

// Fallback helper for environments where IndexedDB might be unavailable
function getLocalStorageItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function setLocalStorageItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // ignore quota errors
  }
}

function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const whiteboardStorage = {
  /**
   * Save active working draft in browser IndexedDB & localStorage
   */
  async saveLocalDraft(data: WhiteboardItem): Promise<void> {
    const payload = {
      ...data,
      cachedAt: Date.now(),
    }
    try {
      await set(ACTIVE_DRAFT_KEY, payload)
      if (data.id) {
        await set(`${IDB_PREFIX}${data.id}`, payload)
      }
    } catch {
      setLocalStorageItem(ACTIVE_DRAFT_KEY, payload)
      if (data.id) {
        setLocalStorageItem(`${IDB_PREFIX}${data.id}`, payload)
      }
    }
  },

  /**
   * Get active working draft or board by id
   */
  async getLocalDraft(id?: string): Promise<WhiteboardItem | null> {
    try {
      if (id) {
        const item = await get<WhiteboardItem>(`${IDB_PREFIX}${id}`)
        if (item) return item
        const fallback = getLocalStorageItem<WhiteboardItem>(`${IDB_PREFIX}${id}`)
        if (fallback) return fallback
      }
      const active = await get<WhiteboardItem>(ACTIVE_DRAFT_KEY)
      if (active) return active
      return getLocalStorageItem<WhiteboardItem>(ACTIVE_DRAFT_KEY)
    } catch {
      if (id) {
        return getLocalStorageItem<WhiteboardItem>(`${IDB_PREFIX}${id}`)
      }
      return getLocalStorageItem<WhiteboardItem>(ACTIVE_DRAFT_KEY)
    }
  },

  /**
   * Save or update a board in the browser's storage
   */
  async saveBoard(data: Partial<WhiteboardItem>): Promise<WhiteboardItem> {
    const id = data.id || `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const board: WhiteboardItem = {
      id,
      title: data.title?.trim() || 'سبورة تفاعلية جديدة',
      pagesData: data.pagesData || [
        {
          id: `page_${Date.now()}`,
          background: 'white',
          elements: [],
        },
      ],
      thumbnail: data.thumbnail || null,
      updatedAt: new Date().toISOString(),
    }

    try {
      await set(`${IDB_PREFIX}${id}`, board)
      await set(ACTIVE_DRAFT_KEY, board)
    } catch {
      setLocalStorageItem(`${IDB_PREFIX}${id}`, board)
      setLocalStorageItem(ACTIVE_DRAFT_KEY, board)
    }

    return board
  },

  /**
   * Get single board by ID
   */
  async getBoardById(id: string): Promise<WhiteboardItem | null> {
    try {
      const item = await get<WhiteboardItem>(`${IDB_PREFIX}${id}`)
      if (item) return item
      return getLocalStorageItem<WhiteboardItem>(`${IDB_PREFIX}${id}`)
    } catch {
      return getLocalStorageItem<WhiteboardItem>(`${IDB_PREFIX}${id}`)
    }
  },

  /**
   * List all saved boards in the browser
   */
  async listBoards(): Promise<Array<Omit<WhiteboardItem, 'pagesData'>>> {
    try {
      const allKeys = await keys()
      const boardKeys = allKeys.filter(
        (k) => typeof k === 'string' && k.startsWith(IDB_PREFIX) && k !== ACTIVE_DRAFT_KEY,
      )
      const list: Array<Omit<WhiteboardItem, 'pagesData'>> = []
      for (const k of boardKeys) {
        const b = await get<WhiteboardItem>(k)
        if (b && b.id) {
          list.push({
            id: b.id,
            title: b.title || 'سبورة تفاعلية',
            thumbnail: b.thumbnail,
            updatedAt: b.updatedAt,
          })
        }
      }

      // Also check localStorage if idb list was empty or partial
      if (list.length === 0) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(IDB_PREFIX) && key !== ACTIVE_DRAFT_KEY) {
            const b = getLocalStorageItem<WhiteboardItem>(key)
            if (b && b.id) {
              list.push({
                id: b.id,
                title: b.title || 'سبورة تفاعلية',
                thumbnail: b.thumbnail,
                updatedAt: b.updatedAt,
              })
            }
          }
        }
      }

      // Sort newest first
      return list.sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return timeB - timeA
      })
    } catch {
      const list: Array<Omit<WhiteboardItem, 'pagesData'>> = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(IDB_PREFIX) && key !== ACTIVE_DRAFT_KEY) {
          const b = getLocalStorageItem<WhiteboardItem>(key)
          if (b && b.id) {
            list.push({
              id: b.id,
              title: b.title || 'سبورة تفاعلية',
              thumbnail: b.thumbnail,
              updatedAt: b.updatedAt,
            })
          }
        }
      }
      return list.sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return timeB - timeA
      })
    }
  },

  /**
   * Delete a board from browser storage
   */
  async deleteBoard(id: string): Promise<void> {
    try {
      await del(`${IDB_PREFIX}${id}`)
    } catch {
      // ignore
    }
    removeLocalStorageItem(`${IDB_PREFIX}${id}`)
  },

  /**
   * Duplicate an existing board
   */
  async duplicateBoard(id: string): Promise<WhiteboardItem> {
    const existing = await this.getBoardById(id)
    if (!existing) {
      throw new Error('السبورة الأصلية غير موجودة')
    }

    const newId = `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const duplicated: WhiteboardItem = {
      ...existing,
      id: newId,
      title: `${existing.title} (نسخة)`,
      pagesData: JSON.parse(JSON.stringify(existing.pagesData || [])),
      updatedAt: new Date().toISOString(),
    }

    try {
      await set(`${IDB_PREFIX}${newId}`, duplicated)
    } catch {
      setLocalStorageItem(`${IDB_PREFIX}${newId}`, duplicated)
    }

    return duplicated
  },

  /**
   * Clear active draft
   */
  async clearActiveDraft(): Promise<void> {
    try {
      await del(ACTIVE_DRAFT_KEY)
    } catch {
      // ignore
    }
    removeLocalStorageItem(ACTIVE_DRAFT_KEY)
  },

  // Backward compatibility alias
  async deleteLocalBoard(id: string): Promise<void> {
    return this.deleteBoard(id)
  },

  async listLocalBoards(): Promise<WhiteboardItem[]> {
    const meta = await this.listBoards()
    const full: WhiteboardItem[] = []
    for (const m of meta) {
      const b = await this.getBoardById(m.id)
      if (b) full.push(b)
    }
    return full
  },
}
