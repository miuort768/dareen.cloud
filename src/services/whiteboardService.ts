import type { WhiteboardItem } from '../types/whiteboard'

const API_BASE = '/api/whiteboards'

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const whiteboardApiService = {
  async list(): Promise<Array<Omit<WhiteboardItem, 'pagesData'>>> {
    const res = await fetch(API_BASE, {
      headers: {
        ...getAuthHeader(),
      },
    })
    if (!res.ok) {
      throw new Error('فشل تحميل قائمة السبورات')
    }
    return res.json()
  },

  async getById(id: string): Promise<WhiteboardItem> {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: {
        ...getAuthHeader(),
      },
    })
    if (!res.ok) {
      throw new Error('فشل استرجاع السبورة')
    }
    const data = await res.json()
    return {
      ...data,
      pagesData: typeof data.pagesData === 'string' ? JSON.parse(data.pagesData) : data.pagesData,
    }
  },

  async create(payload: Partial<WhiteboardItem>): Promise<WhiteboardItem> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        title: payload.title || 'سبورة جديدة',
        pagesData: payload.pagesData || [],
        thumbnail: payload.thumbnail || null,
      }),
    })
    if (!res.ok) {
      throw new Error('فشل إنشاء السبورة على السيرفر')
    }
    const data = await res.json()
    return {
      ...data,
      pagesData: typeof data.pagesData === 'string' ? JSON.parse(data.pagesData) : data.pagesData,
    }
  },

  async update(id: string, payload: Partial<WhiteboardItem>): Promise<WhiteboardItem> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        title: payload.title,
        pagesData: payload.pagesData,
        thumbnail: payload.thumbnail,
      }),
    })
    if (!res.ok) {
      throw new Error('فشل حفظ السبورة على السيرفر')
    }
    const data = await res.json()
    return {
      ...data,
      pagesData: typeof data.pagesData === 'string' ? JSON.parse(data.pagesData) : data.pagesData,
    }
  },

  async duplicate(id: string): Promise<WhiteboardItem> {
    const res = await fetch(`${API_BASE}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
    })
    if (!res.ok) {
      throw new Error('فشل إنشاء نسخة من السبورة')
    }
    const data = await res.json()
    return {
      ...data,
      pagesData: typeof data.pagesData === 'string' ? JSON.parse(data.pagesData) : data.pagesData,
    }
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    })
    if (!res.ok) {
      throw new Error('فشل حذف السبورة')
    }
  },
}
