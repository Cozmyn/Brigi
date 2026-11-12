import { normalizePlanner, plannedDate, type PlannerData } from './planner-model'

export type JpegPage = { jpegBase64: string; width: number; height: number }
const encoder = new TextEncoder()
const ascii = (value: string) => encoder.encode(value)
const pageWidth = 595.28
const pageHeight = 841.89

/**
 * Create a portable PDF with embedded JPEG pages, without third-party scripts
 * or network calls. Planner text is rendered locally with browser-installed
 * fonts so Romanian diacritics remain legible; PDF pages are image-based.
 */
export function assemblePlannerPDF(pages: JpegPage[]): Uint8Array {
  if (!pages.length || pages.length > 20) throw new Error('Documentul are prea multe pagini.')
  const chunks: Uint8Array[] = []
  const offsets: number[] = [0]
  let position = 0
  const write = (bytes: Uint8Array) => { chunks.push(bytes); position += bytes.byteLength }
  const text = (value: string) => write(ascii(value))
  const object = (id: number, body: () => void) => {
    offsets[id] = position
    text(String(id) + ' 0 obj\n')
    body()
    text('\nendobj\n')
  }
  const images = pages.map((page) => {
    if (!Number.isSafeInteger(page.width) || !Number.isSafeInteger(page.height) ||
        page.width < 1 || page.height < 1 || page.width > 4000 || page.height > 4000 ||
        page.jpegBase64.length > 12_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(page.jpegBase64))
      throw new Error('Pagină PDF invalidă.')
    const raw = atob(page.jpegBase64)
    const result = Uint8Array.from(raw, (character) => character.charCodeAt(0))
    if (result.length < 4 || result[0] !== 255 || result[1] !== 216 ||
        result[result.length - 2] !== 255 || result[result.length - 1] !== 217)
      throw new Error('Imagine JPEG invalidă.')
    return { ...page, bytes: result }
  })
  text('%PDF-1.4\n%Brigitta planner\n')
  object(1, () => text('<< /Type /Catalog /Pages 2 0 R >>'))
  object(2, () => text('<< /Type /Pages /Kids [' +
    pages.map((_, i) => String(3 + i * 3) + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>'))
  images.forEach((image, i) => {
    const pageId = 3 + i * 3
    const streamId = pageId + 1
    const imageId = pageId + 2
    object(pageId, () => text('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
      pageWidth + ' ' + pageHeight + '] /Resources << /ProcSet [/PDF /ImageC] ' +
      '/XObject << /Im1 ' + imageId + ' 0 R >> >> /Contents ' + streamId + ' 0 R >>'))
    object(streamId, () => {
      const instructions = 'q ' + pageWidth + ' 0 0 ' + pageHeight + ' 0 0 cm /Im1 Do Q\n'
      text('<< /Length ' + ascii(instructions).length + ' >>\nstream\n')
      text(instructions)
      text('endstream')
    })
    object(imageId, () => {
      text('<< /Type /XObject /Subtype /Image /Width ' + image.width +
        ' /Height ' + image.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 ' +
        '/Filter /DCTDecode /Length ' + image.bytes.length + ' >>\nstream\n')
      write(image.bytes)
      text('\nendstream')
    })
  })
  const xref = position
  const size = 3 + images.length * 3
  text('xref\n0 ' + size + '\n0000000000 65535 f \n')
  for (let i = 1; i < size; i++)
    text(String(offsets[i]).padStart(10, '0') + ' 00000 n \n')
  text('trailer\n<< /Size ' + size + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n')
  const pdf = new Uint8Array(position)
  let cursor = 0
  for (const chunk of chunks) {
    pdf.set(chunk, cursor)
    cursor += chunk.length
  }
  return pdf
}

const WIDTH = 1240
const HEIGHT = 1754
const LEFT = 100
const RIGHT = WIDTH - LEFT
const BOTTOM = HEIGHT - 145

type CanvasPage = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; y: number }

/** Client-only render: no images or personal notes leave the device. */
export async function exportPlannerPDF(input: PlannerData, locale: 'ro' | 'en' = 'ro') {
  const data = normalizePlanner(input)
  if (!data) throw new Error(locale === 'en' ? 'Invalid planner data.' : 'Datele plannerului sunt invalide.')
  await document.fonts.ready
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif'
  const pages: CanvasPage[] = []
  const title = locale === 'en' ? 'EVENT PLANNER' : 'PLANUL EVENIMENTULUI'
  const intro = locale === 'en' ? 'A private planning document. No booking is made.' :
    'Document de planificare personală. Nu reprezintă o rezervare.'
  const createPage = () => {
    if (pages.length >= 20) throw new Error('Plannerul depășește 20 de pagini.')
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Exportul PDF nu este suportat de acest browser.')
    ctx.fillStyle = '#faf8f3'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#173334'
    ctx.fillRect(0, 0, WIDTH, 205)
    ctx.fillStyle = '#e6c18b'
    ctx.font = '700 27px ' + font
    ctx.fillText('BRIGITTA  /  INSTRUMENTE', LEFT, 62)
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 45px ' + font
    ctx.fillText(title, LEFT, 125)
    ctx.font = '400 23px ' + font
    ctx.fillText(intro, LEFT, 167)
    ctx.fillStyle = '#d9d7d1'
    ctx.fillRect(LEFT, HEIGHT - 114, RIGHT - LEFT, 1)
    const page = { canvas, ctx, y: 253 }
    pages.push(page)
    return page
  }
  let current = createPage()
  const ensure = (height: number) => {
    if (current.y + height > BOTTOM) current = createPage()
  }
  const writeLines = (value: string, size: number, color: string, maxWidth = RIGHT - LEFT,
    weight = 400, lineHeight = size * 1.5) => {
    const ctx = current.ctx
    const wrap = (line: string) => {
      ctx.font = String(weight) + ' ' + size + 'px ' + font
      const words = line.split(/\s+/).filter(Boolean)
      const result: string[] = []
      let candidate = ''
      for (const word of words) {
        if (!candidate) { candidate = word; continue }
        if (ctx.measureText(candidate + ' ' + word).width <= maxWidth) candidate += ' ' + word
        else { result.push(candidate); candidate = word }
      }
      if (candidate) result.push(candidate)
      return result.length ? result : [' ']
    }
    for (const paragraph of value.split('\n')) {
      for (const line of wrap(paragraph)) {
        ensure(lineHeight)
        current.ctx.font = String(weight) + ' ' + size + 'px ' + font
        current.ctx.fillStyle = color
        current.ctx.fillText(line, LEFT, current.y, maxWidth)
        current.y += lineHeight
      }
    }
  }
  const section = (label: string) => {
    ensure(90)
    current.y += 26
    current.ctx.fillStyle = '#bc8f56'
    current.ctx.fillRect(LEFT, current.y - 6, 36, 3)
    current.ctx.font = '700 27px ' + font
    current.ctx.fillStyle = '#173334'
    current.ctx.fillText(label.toUpperCase(), LEFT + 51, current.y + 2)
    current.y += 50
  }

  section(locale === 'en' ? 'Event details' : 'Detalii eveniment')
  const labelValues: [string, string][] = [
    [locale === 'en' ? 'Event' : 'Eveniment', data.eventName || data.eventType || '-'],
    [locale === 'en' ? 'Date' : 'Data', plannedDate(data, locale)],
    [locale === 'en' ? 'Location' : 'Localitate', data.city || (locale === 'en' ? 'To be confirmed' : 'De stabilit')],
    [locale === 'en' ? 'Guests' : 'Invitați', data.guestCount || '-'],
  ]
  for (const [label, value] of labelValues) {
    writeLines(label + ':  ' + value, 27, '#2d4041', RIGHT - LEFT, 500, 43)
  }
  section(locale === 'en' ? 'Event timeline' : 'Cronologia evenimentului')
  if (!data.moments.length) writeLines(locale === 'en' ? 'Add your first moment.' :
    'Adaugă primul moment în planner.', 26, '#566768')
  for (const [index, moment] of data.moments.entries()) {
    ensure(95)
    writeLines(String(index + 1).padStart(2, '0') + '   ' + (moment.time || '--:--') +
      '  /  ' + (moment.title || (locale === 'en' ? 'Untitled moment' : 'Moment fără titlu')) +
      (moment.done ? '  ✓' : ''), 28, '#173334', RIGHT - LEFT, 700, 45)
    if (moment.notes) writeLines('     ' + moment.notes, 22, '#566768', RIGHT - LEFT - 42, 400, 34)
    current.y += 18
  }
  if (data.notes.trim()) {
    section(locale === 'en' ? 'Additional notes' : 'Note de organizare')
    writeLines(data.notes, 24, '#314b4c', RIGHT - LEFT, 400, 39)
  }
  pages.forEach((page, index) => {
    page.ctx.font = '400 20px ' + font
    page.ctx.fillStyle = '#566768'
    page.ctx.fillText(locale === 'en' ? 'Personal draft · Not a confirmed offer' :
      'Plan personal · Nu este o ofertă confirmată', LEFT, HEIGHT - 70)
    page.ctx.textAlign = 'right'
    page.ctx.fillText(String(index + 1) + ' / ' + String(pages.length), RIGHT, HEIGHT - 70)
    page.ctx.textAlign = 'left'
  })
  const images = pages.map(({ canvas }) => ({
    jpegBase64: canvas.toDataURL('image/jpeg', 0.88).split(',')[1],
    width: WIDTH, height: HEIGHT,
  }))
  const pdf = assemblePlannerPDF(images)
  const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'brigitta-plan-eveniment.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 15_000)
  return { pages: pages.length, bytes: pdf.length }
}
