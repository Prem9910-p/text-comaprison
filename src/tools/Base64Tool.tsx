import { useState } from 'react'

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64Utf8(value: string): string {
  const normalized = value.replace(/\s+/g, '')
  const binary = atob(normalized)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const runEncode = () => {
    try {
      setOutput(encodeBase64Utf8(input))
      setMessage({ type: 'success', text: 'Encoded successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Could not encode input.' })
    }
  }

  const runDecode = () => {
    try {
      setOutput(decodeBase64Utf8(input))
      setMessage({ type: 'success', text: 'Decoded successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Invalid Base64 input. Please check and try again.' })
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setMessage(null)
  }

  return (
    <section className="tool-panel">
      <div className="tool-actions tool-actions--wrap">
        <button type="button" className="btn btn--primary" onClick={runEncode}>
          Encode
        </button>
        <button type="button" className="btn btn--ghost" onClick={runDecode}>
          Decode
        </button>
        <button type="button" className="btn btn--ghost" onClick={clearAll}>
          Clear
        </button>
      </div>

      {message && (
        <p className={`json-message ${message.type === 'success' ? 'json-message--success' : 'json-message--error'}`}>
          {message.text}
        </p>
      )}

      <div className="tool-split">
        <textarea
          className="tool-textarea tool-textarea--code"
          placeholder="Input text or Base64..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        <textarea
          className="tool-textarea tool-textarea--code"
          placeholder="Output..."
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          spellCheck={false}
        />
      </div>
    </section>
  )
}
