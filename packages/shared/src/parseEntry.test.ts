import { describe, expect, it } from 'vitest'
import { parseQuickEntry } from './parseEntry'

const keywords = [
  { keyword: 'coding', categoryId: 1 },
  { keyword: 'youtube', categoryId: 3 }
]

describe('parseQuickEntry', () => {
  it('parses DSA 2h', () => {
    const r = parseQuickEntry('DSA 2h', keywords)
    expect(r?.durationMinutes).toBe(120)
    expect(r?.title).toBe('DSA')
  })

  it('parses youtube 45m', () => {
    const r = parseQuickEntry('youtube 45m', keywords)
    expect(r?.durationMinutes).toBe(45)
    expect(r?.categoryId).toBe(3)
    expect(r?.confidence).toBe('high')
  })

  it('parses sentence with hours', () => {
    const r = parseQuickEntry('Worked on food donation app for 2 hours', keywords)
    expect(r?.durationMinutes).toBe(120)
    expect(r?.title.toLowerCase()).toContain('food donation')
  })

  it('parses gym 1.5h', () => {
    const r = parseQuickEntry('gym 1.5h', keywords)
    expect(r?.durationMinutes).toBe(90)
  })
})
