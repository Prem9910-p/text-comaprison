import { useMemo, useState } from 'react'

export function DedupeLinesTool() {
  const [dedupeInput, setDedupeInput] = useState('')
  const [dedupeCaseSensitive, setDedupeCaseSensitive] = useState(false)
  const [dedupeTrimWhitespace, setDedupeTrimWhitespace] = useState(true)

  const dedupeResult = useMemo(() => {
    if (!dedupeInput) return ''
    const lines = dedupeInput.split(/\r?\n/)
    const seen = new Set<string>()
    const unique: string[] = []
    for (const line of lines) {
      const normalized = dedupeTrimWhitespace ? line.trim() : line
      const key = dedupeCaseSensitive ? normalized : normalized.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(line)
    }
    return unique.join('\n')
  }, [dedupeInput, dedupeCaseSensitive, dedupeTrimWhitespace])

  return (
    <section className="tool-panel">
      <div className="tool-actions">
        <label className="options__item">
          <input
            type="checkbox"
            checked={dedupeTrimWhitespace}
            onChange={() => setDedupeTrimWhitespace((v) => !v)}
          />
          Trim line spaces before compare
        </label>
        <label className="options__item">
          <input
            type="checkbox"
            checked={dedupeCaseSensitive}
            onChange={() => setDedupeCaseSensitive((v) => !v)}
          />
          Case sensitive
        </label>
      </div>
      <div className="tool-split">
        <textarea
          className="tool-textarea"
          placeholder="Paste lines (duplicates will be removed)..."
          value={dedupeInput}
          onChange={(e) => setDedupeInput(e.target.value)}
          spellCheck={false}
        />
        <textarea
          className="tool-textarea"
          value={dedupeResult}
          readOnly
          placeholder="Unique lines output..."
          spellCheck={false}
        />
      </div>
    </section>
  )
}
