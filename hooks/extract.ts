import type { CopyItem } from '../types'

const FENCE = /```[^\n]*\n([\s\S]*?)```/g
const INLINE = /`([^`\n]+)`/g
const URL = /https?:\/\/[^\s<>"'`)\]]+/g

// Paths and commands are worth a button; keys (`ctrl+x`) and words are not.
const isPath = (s: string) => /^[~./]/.test(s) || /\w\/\w/.test(s)
const isCommand = (s: string) => /\s/.test(s) && s.length >= 8
const looksCopyable = (s: string) => s.length >= 3 && (isPath(s) || isCommand(s))

export const extractItems = (reply: string, limit = 6): CopyItem[] => {
  const seen = new Set<string>()
  const items: CopyItem[] = []
  const add = (kind: CopyItem['kind'], raw: string) => {
    const text = raw.replace(/\s+$/, '').replace(/^\n+/, '')
    if (text.length < 2 || seen.has(text)) return
    seen.add(text)
    items.push({ kind, text })
  }

  for (const m of reply.matchAll(FENCE)) add('code', m[1] ?? '')
  const prose = reply.replace(FENCE, '')
  for (const m of prose.matchAll(INLINE)) {
    const s = (m[1] ?? '').trim()
    if (!looksCopyable(s)) continue
    add(isPath(s) && !/\s/.test(s) ? 'path' : 'text', s)
  }
  for (const m of prose.matchAll(URL)) add('url', m[0].replace(/[.,;:]+$/, ''))

  return items.slice(0, limit)
}

export const labelFor = (item: CopyItem, width = 48) => {
  const lines = item.text.split('\n')
  let first = (lines[0] ?? '').trim()
  if (first.length > width) first = first.slice(0, width - 1) + '…'
  return lines.length > 1 ? `${first} (+${lines.length - 1})` : first
}

export type Segment = { kind: 'prose'; text: string } | { kind: 'code'; text: string; language: string }

const FENCE_SPLIT = /```([^\n]*)\n([\s\S]*?)```/g

// Splits a reply block into prose and fenced code, in order.
export const splitSegments = (reply: string): Segment[] => {
  const segments: Segment[] = []
  let last = 0
  for (const m of reply.matchAll(FENCE_SPLIT)) {
    const start = m.index ?? 0
    if (start > last) segments.push({ kind: 'prose', text: reply.slice(last, start) })
    segments.push({ kind: 'code', language: (m[1] ?? '').trim(), text: (m[2] ?? '').replace(/\n$/, '') })
    last = start + m[0].length
  }
  if (last < reply.length) segments.push({ kind: 'prose', text: reply.slice(last) })
  return segments.filter(seg => seg.kind === 'code' || seg.text.trim() !== '')
}
