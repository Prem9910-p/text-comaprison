import { useMemo, useState } from 'react'

export function WordCounterTool() {
  const [wordInput, setWordInput] = useState('')

  const wordStats = useMemo(() => {
    const words = wordInput.trim() ? wordInput.trim().split(/\s+/).length : 0
    const characters = wordInput.length
    const charactersNoSpaces = wordInput.replace(/\s/g, '').length
    const lines = wordInput.length === 0 ? 0 : wordInput.split(/\r?\n/).length
    const paragraphs = wordInput.trim()
      ? wordInput.trim().split(/\n\s*\n/).filter(Boolean).length
      : 0
    return { words, characters, charactersNoSpaces, lines, paragraphs }
  }, [wordInput])

  return (
    <section className="tool-panel">
      <textarea
        className="tool-textarea"
        placeholder="Type or paste text to count..."
        value={wordInput}
        onChange={(e) => setWordInput(e.target.value)}
        spellCheck={false}
      />
      <div className="stat-grid">
        <div className="stat-card"><span>Words</span><strong>{wordStats.words}</strong></div>
        <div className="stat-card"><span>Characters</span><strong>{wordStats.characters}</strong></div>
        <div className="stat-card"><span>No spaces</span><strong>{wordStats.charactersNoSpaces}</strong></div>
        <div className="stat-card"><span>Lines</span><strong>{wordStats.lines}</strong></div>
        <div className="stat-card"><span>Paragraphs</span><strong>{wordStats.paragraphs}</strong></div>
      </div>
    </section>
  )
}
