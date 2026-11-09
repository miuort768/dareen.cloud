import { describe, it, expect } from 'vitest'
import { getElementBounds, hitTestElement } from './canvasRenderer'
import type { PathElement, ShapeElement, LineElement } from '../../types/whiteboard'

describe('Whiteboard Canvas Engine', () => {
  it('correctly calculates bounds for shape elements', () => {
    const rect: ShapeElement = {
      id: 'rect_1',
      type: 'rect',
      x: 100,
      y: 150,
      width: 200,
      height: 100,
      strokeColor: '#000000',
      strokeWidth: 2,
    }
    const bounds = getElementBounds(rect)
    expect(bounds).toEqual({
      x: 100,
      y: 150,
      width: 200,
      height: 100,
    })
  })

  it('correctly calculates bounds for freehand paths', () => {
    const path: PathElement = {
      id: 'path_1',
      type: 'path',
      x: 50,
      y: 50,
      points: [
        { x: 50, y: 50 },
        { x: 120, y: 80 },
        { x: 30, y: 200 },
      ],
      strokeColor: '#ff0000',
      strokeWidth: 4,
    }
    const bounds = getElementBounds(path)
    expect(bounds.x).toBe(30)
    expect(bounds.y).toBe(50)
    expect(bounds.width).toBe(90) // 120 - 30
    expect(bounds.height).toBe(150) // 200 - 50
  })

  it('accurately hits test elements with padding', () => {
    const line: LineElement = {
      id: 'line_1',
      type: 'line',
      x: 100,
      y: 100,
      endX: 300,
      endY: 100,
      strokeColor: '#000000',
      strokeWidth: 4,
    }

    // Inside bounds
    expect(hitTestElement(line, { x: 200, y: 100 })).toBe(true)

    // Within tolerance padding
    expect(hitTestElement(line, { x: 200, y: 105 })).toBe(true)

    // Outside bounds
    expect(hitTestElement(line, { x: 200, y: 150 })).toBe(false)
  })
})
