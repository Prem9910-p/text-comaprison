import type { ToolCard, ToolId } from './types'

export const toolCards: ToolCard[] = [
  {
    id: 'compare',
    name: 'Text Compare',
    description: 'Side-by-side diff with line numbers and inline highlights.',
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, lines, and paragraphs instantly.',
  },
  {
    id: 'dedupe-lines',
    name: 'Remove Duplicate Lines',
    description: 'Keep unique lines only while preserving original order.',
  },
  {
    id: 'case-converter',
    name: 'Text Case Converter',
    description: 'Convert text to uppercase, lowercase, title, sentence, or toggle case.',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Validate, prettify, and minify JSON safely in-browser.',
  },
]

const validToolIds = new Set<ToolId>([
  'home',
  'compare',
  'word-counter',
  'dedupe-lines',
  'case-converter',
  'json-formatter',
  'about-us',
  'contact-us',
  'privacy-policy',
  'terms-and-conditions',
])

export function parseToolFromHash(hash: string): ToolId {
  const value = hash.replace(/^#/, '')
  return validToolIds.has(value as ToolId) ? (value as ToolId) : 'home'
}

export function getToolTitle(activeTool: ToolId): string {
  if (activeTool === 'home') return 'Text Utilities'
  if (activeTool === 'about-us') return 'About Us'
  if (activeTool === 'contact-us') return 'Contact Us'
  if (activeTool === 'privacy-policy') return 'Privacy Policy'
  if (activeTool === 'terms-and-conditions') return 'Terms & Conditions'
  return toolCards.find((tool) => tool.id === activeTool)?.name ?? 'Text Utilities'
}
