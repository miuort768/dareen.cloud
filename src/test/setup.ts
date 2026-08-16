import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest'

// Start MSW server for all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock localStorage
const store = new Map<string, string>()
const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Clean up between tests
beforeEach(() => {
    localStorage.clear()
})
