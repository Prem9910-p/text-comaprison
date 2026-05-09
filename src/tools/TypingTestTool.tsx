import { useEffect, useMemo, useState } from 'react'

const SAMPLE_TEXTS = [
  'Fast typists stay accurate first and speed up naturally over time. Focus on rhythm, relaxed hands, and consistent practice to improve your typing performance.',
  'The quick brown fox jumps over the lazy dog while developers ship features, fix bugs, and write clean code that is easy to maintain and understand.',
  'Typing tests help measure your words per minute and accuracy. Build muscle memory with proper finger placement and avoid looking at the keyboard too often.',
]

const TEST_DURATION_SECONDS = 60

function getRandomText() {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
}

export function TypingTestTool() {
  const [targetText, setTargetText] = useState(getRandomText)
  const [typedText, setTypedText] = useState('')
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (startedAtMs === null) return
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAtMs
      setElapsedMs(nextElapsed)
    }, 150)
    return () => window.clearInterval(timer)
  }, [startedAtMs])

  const elapsedSeconds = Math.min(TEST_DURATION_SECONDS, elapsedMs / 1000)
  const remainingSeconds = Math.max(0, TEST_DURATION_SECONDS - elapsedSeconds)
  const isFinished = remainingSeconds <= 0

  const stats = useMemo(() => {
    const typedChars = typedText.length
    const comparedLength = Math.min(typedChars, targetText.length)

    let correctChars = 0
    for (let i = 0; i < comparedLength; i += 1) {
      if (typedText[i] === targetText[i]) correctChars += 1
    }

    const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0
    const grossWpm = elapsedMinutes > 0 ? typedChars / 5 / elapsedMinutes : 0
    const netWpm = elapsedMinutes > 0 ? correctChars / 5 / elapsedMinutes : 0
    const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 100

    return {
      typedChars,
      correctChars,
      grossWpm,
      netWpm,
      accuracy,
    }
  }, [elapsedSeconds, targetText, typedText])

  const handleInput = (value: string) => {
    if (isFinished) return
    if (startedAtMs === null) setStartedAtMs(Date.now())
    setTypedText(value)
  }

  const resetTest = () => {
    setTypedText('')
    setStartedAtMs(null)
    setElapsedMs(0)
    setTargetText(getRandomText())
  }

  return (
    <section className="tool-panel">
      <div className="typing-test__header">
        <p className="typing-test__timer">Time left: {Math.ceil(remainingSeconds)}s</p>
        <button type="button" className="btn btn--ghost" onClick={resetTest}>
          New test
        </button>
      </div>

      <div className="typing-test__prompt">{targetText}</div>

      <textarea
        className="tool-textarea tool-textarea--code"
        placeholder="Start typing the text above..."
        value={typedText}
        onChange={(e) => handleInput(e.target.value)}
        spellCheck={false}
        disabled={isFinished}
      />

      <div className="stat-grid">
        <div className="stat-card">
          <span>Gross WPM</span>
          <strong>{Math.round(stats.grossWpm)}</strong>
        </div>
        <div className="stat-card">
          <span>Net WPM</span>
          <strong>{Math.round(stats.netWpm)}</strong>
        </div>
        <div className="stat-card">
          <span>Accuracy</span>
          <strong>{Math.round(stats.accuracy)}%</strong>
        </div>
        <div className="stat-card">
          <span>Typed chars</span>
          <strong>{stats.typedChars}</strong>
        </div>
      </div>
    </section>
  )
}
