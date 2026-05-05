import { useCallback, useState } from 'react'

function toTitleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}

function toSentenceCase(value: string) {
  const lower = value.toLowerCase()
  let shouldUppercase = true
  let out = ''
  for (const ch of lower) {
    if (/[a-z]/.test(ch) && shouldUppercase) {
      out += ch.toUpperCase()
      shouldUppercase = false
      continue
    }
    out += ch
    if (/[.!?]/.test(ch)) shouldUppercase = true
  }
  return out
}

function toToggleCase(value: string) {
  let out = ''
  for (const ch of value) {
    const upper = ch.toUpperCase()
    const lower = ch.toLowerCase()
    if (ch === upper && ch !== lower) out += lower
    else if (ch === lower && ch !== upper) out += upper
    else out += ch
  }
  return out
}

export function CaseConverterTool() {
  const [caseInput, setCaseInput] = useState('')

  const applyCase = useCallback((kind: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle') => {
    setCaseInput((current) => {
      if (kind === 'upper') return current.toUpperCase()
      if (kind === 'lower') return current.toLowerCase()
      if (kind === 'title') return toTitleCase(current)
      if (kind === 'sentence') return toSentenceCase(current)
      return toToggleCase(current)
    })
  }, [])

  return (
    <section className="tool-panel">
      <div className="tool-actions tool-actions--wrap">
        <button type="button" className="btn btn--ghost" onClick={() => applyCase('upper')}>
          UPPERCASE
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => applyCase('lower')}>
          lowercase
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => applyCase('title')}>
          Title Case
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => applyCase('sentence')}
        >
          Sentence case
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => applyCase('toggle')}>
          tOGGLE cASE
        </button>
      </div>
      <textarea
        className="tool-textarea"
        placeholder="Type text and click any case conversion button."
        value={caseInput}
        onChange={(e) => setCaseInput(e.target.value)}
        spellCheck={false}
      />
    </section>
  )
}
