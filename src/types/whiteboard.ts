export type WhiteboardTool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'text'
  | 'line'
  | 'arrow'
  | 'doubleArrow'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'mathSymbol'
  | 'ruler'
  | 'protractor'

export type BackgroundPattern = 'white' | 'black' | 'grid' | 'ruled' | 'dots'

export interface Point {
  x: number
  y: number
}

export type ElementType =
  | 'path'
  | 'line'
  | 'arrow'
  | 'doubleArrow'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'text'
  | 'math'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  rotation?: number
  strokeColor: string
  fillColor?: string
  strokeWidth: number
  opacity?: number
}

export interface PathElement extends BaseElement {
  type: 'path'
  points: Point[]
  isHighlighter?: boolean
}

export interface LineElement extends BaseElement {
  type: 'line' | 'arrow' | 'doubleArrow'
  endX: number
  endY: number
}

export interface ShapeElement extends BaseElement {
  type: 'rect' | 'ellipse' | 'triangle' | 'star'
  width: number
  height: number
}

export interface TextElement extends BaseElement {
  type: 'text' | 'math'
  text: string
  fontSize: number
  fontFamily?: string
  width?: number
  height?: number
}

export type WhiteboardElement = PathElement | LineElement | ShapeElement | TextElement

export interface WhiteboardPage {
  id: string
  title?: string
  background: BackgroundPattern
  elements: WhiteboardElement[]
}

export interface WhiteboardItem {
  id: string
  teacherId?: string
  title: string
  pagesData: WhiteboardPage[]
  thumbnail?: string | null
  createdAt?: string
  updatedAt?: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'
