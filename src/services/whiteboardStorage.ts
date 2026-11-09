import { get, set, del, keys } from 'idb-keyval'
import type { WhiteboardItem } from '../types/whiteboard'

const IDB_PREFIX = 'dareen_whiteboard_'
const ACTIVE_DRAFT_KEY = 'dareen_whiteboard_active_draft'

export const whiteboardStorage = {
  async saveLocalDraft(data: WhiteboardItem): Promise<void> {
    try {
      await set(ACTIVE_DRAFT_KEY, {
        ...data,
        cachedAt: Date.now(),
      })
      if (data.id) {
        await set(`${IDB_PREFIX}${data.id}`, {
          ...data,
          cachedAt: Date.now(),
        })
      }
    } catch (err) {
      console.warn('Failed to save to IndexedDB', err)
    }
  },

  async getLocalDraft(id?: string): Promise<WhiteboardItem | null> {
    try {
      if (id) {
        const item = await get<WhiteboardItem>(`${IDB_PREFIX}${id}`)
        if (item) return item
      }
      const active = await get<WhiteboardItem>(ACTIVE_DRAFT_KEY)
      return active || null
    } catch (err) {
      console.warn('Failed to read from IndexedDB', err)
      return null
    }
  },

  async clearActiveDraft(): Promise<void> {
    try {
      await del(ACTIVE_DRAFT_KEY)
    } catch (err) {
      console.warn('Failed to clear active draft', err)
    }
  },

  async deleteLocalBoard(id: string): Promise<void> {
    try {
      await del(`${IDB_PREFIX}${id}`)
    } catch (err) {
      console.warn('Failed to delete local board', err)
    }
  },

  async listLocalBoards(): Promise<WhiteboardItem[]> {
    try {
      const allKeys = await keys()
      const boardKeys = allKeys.filter(
        (k) => typeof k === 'string' && k.startsWith(IDB_PREFIX) && k !== ACTIVE_DRAFT_KEY,
      )
      const list: WhiteboardItem[] = []
      for (const k of boardKeys) {
        const b = await get<WhiteboardItem>(k)
        if (b) list.push(b)
      }
      return list
    } catch (err) {
      console.warn('Failed to list local boards', err)
      return []
    }
  },
}
