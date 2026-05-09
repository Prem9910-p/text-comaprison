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
  {
    id: 'typing-test',
    name: 'Typing Test',
    description: 'Practice speed and accuracy with a 60-second typing challenge.',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate and download QR codes from text, links, or any input.',
  },
  {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    description: 'Encode plain text to Base64 and decode Base64 back to readable text.',
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate and download barcodes in multiple formats quickly.',
  },
]

const validToolIds = new Set<ToolId>([
  'home',
  'compare',
  'word-counter',
  'dedupe-lines',
  'case-converter',
  'json-formatter',
  'typing-test',
  'qr-code-generator',
  'base64',
  'barcode-generator',
  'about-us',
  'contact-us',
  'privacy-policy',
  'terms-and-conditions',
])

export function parseToolFromPath(pathname: string): ToolId {
  const value = pathname.replace(/^\/+|\/+$/g, '')
  if (!value) return 'home'
  return validToolIds.has(value as ToolId) ? (value as ToolId) : 'home'
}

export function parseToolFromHash(hash: string): ToolId {
  const value = hash.replace(/^#/, '')
  return validToolIds.has(value as ToolId) ? (value as ToolId) : 'home'
}

export function getPathForTool(tool: ToolId): string {
  if (tool === 'home') return '/'
  return `/${tool}`
}

export function getToolTitle(activeTool: ToolId): string {
  if (activeTool === 'home') return 'Text Utilities'
  if (activeTool === 'about-us') return 'About Us'
  if (activeTool === 'contact-us') return 'Contact Us'
  if (activeTool === 'privacy-policy') return 'Privacy Policy'
  if (activeTool === 'terms-and-conditions') return 'Terms & Conditions'
  return toolCards.find((tool) => tool.id === activeTool)?.name ?? 'Text Utilities'
}
