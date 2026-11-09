import { jsPDF } from 'jspdf'
import type { WhiteboardPage } from '../types/whiteboard'
import { drawBackground } from './backgroundRenderer'
import { drawElement } from './canvasRenderer'

export async function exportCurrentPageAsPng(
  page: WhiteboardPage,
  width = 1920,
  height = 1080,
  filename = 'whiteboard-page.png',
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Render
  drawBackground(ctx, width, height, page.background)
  page.elements.forEach((el) => {
    drawElement(ctx, el, false)
  })

  // Download
  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export async function exportAllPagesAsPdf(
  pages: WhiteboardPage[],
  filename = 'whiteboard-presentation.pdf',
) {
  if (!pages.length) return

  const width = 1920
  const height = 1080
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [width, height],
  })

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    if (i > 0) {
      pdf.addPage([width, height], 'landscape')
    }

    ctx.clearRect(0, 0, width, height)
    drawBackground(ctx, width, height, page.background)
    page.elements.forEach((el) => {
      drawElement(ctx, el, false)
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
  }

  pdf.save(filename)
}

export function printWhiteboard(page: WhiteboardPage, width = 1920, height = 1080) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawBackground(ctx, width, height, page.background)
  page.elements.forEach((el) => {
    drawElement(ctx, el, false)
  })

  const dataUrl = canvas.toDataURL('image/png')
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>طباعة السبورة</title>
      <style>
        @page { size: landscape; margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" onload="window.print(); window.close();" />
    </body>
    </html>
  `)
  printWindow.document.close()
}

export function generateThumbnail(page: WhiteboardPage, width = 320, height = 180): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Scale down from virtual 1920x1080
  const scale = width / 1920
  ctx.scale(scale, scale)

  drawBackground(ctx, 1920, 1080, page.background)
  page.elements.forEach((el) => {
    drawElement(ctx, el, false)
  })

  return canvas.toDataURL('image/webp', 0.6)
}
