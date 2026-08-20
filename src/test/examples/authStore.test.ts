import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '../../store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    })
  })

  it('initializes with defaults when localStorage is empty', () => {
    const state = useAuthStore.getState()
    expect(state.currentUser).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
  })

  it('login succeeds with valid credentials', async () => {
    await act(async () => {
      const result = await useAuthStore.getState().login('admin', 'admin123')
      expect(result).toBe(true)
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.currentUser).toBeTruthy()
    expect(state.token).toBeTruthy()
  })

  it('login returns false for invalid credentials', async () => {
    await act(async () => {
      const result = await useAuthStore.getState().login('admin', 'wrongpass')
      expect(result).toBe(false)
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('logout clears auth state and localStorage', () => {
    useAuthStore.setState({
      currentUser: {
        id: '1',
        username: 'admin',
        role: 'admin',
        name: '',
        phone: '',
        permissions: [],
      },
      isAuthenticated: true,
      token: 'test-token',
    })
    localStorage.setItem('auth_token', 'test-token')
    localStorage.setItem('app_isAuthenticated', 'true')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.currentUser).toBeNull()
    expect(state.token).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('reacts to global auth_logout event', () => {
    useAuthStore.setState({
      currentUser: {
        id: '1',
        username: 'admin',
        role: 'admin',
        name: '',
        phone: '',
        permissions: [],
      },
      isAuthenticated: true,
      token: 'test-token',
    })

    window.dispatchEvent(new Event('auth_logout'))

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
