import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { DiffPanel, buildDiffRows } from './components/DiffPanel'
import {
  type PreprocessOptions,
  preprocessText,
} from './utils/preprocess'
import './App.css'

const defaultOptions: PreprocessOptions = {
  toLowercase: false,
  sortLines: false,
  replaceLineBreaksWithSpaces: false,
  removeExcessWhitespace: false,
}

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem('text-comparison-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  })

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('text-comparison-theme', next)
      return next
    })
  }, [])

  return { theme, toggle }
}

export default function App() {
  const { theme, toggle } = useTheme()
  const leftRef = useRef<HTMLTextAreaElement>(null)
  const rightRef = useRef<HTMLTextAreaElement>(null)
  const compareResultRef = useRef<HTMLDivElement>(null)
  const optionsId = useId()

  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [opts, setOpts] = useState<PreprocessOptions>(defaultOptions)
  const [compared, setCompared] = useState(false)

  const processed = useMemo(() => {
    return {
      left: preprocessText(left, opts),
      right: preprocessText(right, opts),
    }
  }, [left, right, opts])

  const identical = processed.left === processed.right

  const diffRows = useMemo(() => {
    if (!compared || identical) return null
    return buildDiffRows(processed.left, processed.right)
  }, [compared, identical, processed.left, processed.right])

  const runCompare = useCallback(() => {
    setCompared(true)
  }, [])

  const clearAll = useCallback(() => {
    setLeft('')
    setRight('')
    setCompared(false)
    setOpts(defaultOptions)
  }, [])

  const switchTexts = useCallback(() => {
    setLeft(right)
    setRight(left)
    setCompared(false)
  }, [left, right])

  const focusEditors = useCallback(() => {
    leftRef.current?.focus()
    leftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const toggleOption = (key: keyof PreprocessOptions) => {
    setOpts((o) => ({ ...o, [key]: !o[key] }))
    setCompared(false)
  }

  useEffect(() => {
    if (compared) {
      compareResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [compared])

  return (
    <div className={`app app--${theme}`} data-theme={theme}>
      <header className="app__hero">
        <button
          type="button"
          className="app__theme"
          onClick={toggle}
          title={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <h1 className="app__title">Text Compare!</h1>
      </header>

      <main className="app__main">
        <div className="toolbar">
          <div className="toolbar__group toolbar__group--left">
            <button type="button" className="btn btn--ghost" onClick={focusEditors}>
              Edit texts...
            </button>
            <button type="button" className="btn btn--ghost" onClick={switchTexts}>
              Switch texts
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={runCompare}>
            Compare!
          </button>
          <div className="toolbar__group toolbar__group--right">
            <button type="button" className="btn btn--ghost" onClick={clearAll}>
              Clear all
            </button>
          </div>
        </div>

        <div className="compare-result" ref={compareResultRef}>
          {compared && identical && (
            <div className="diff-identical">
              <p>No differences — texts match (after preprocessing).</p>
            </div>
          )}
          {compared && !identical && diffRows !== null && (
            <DiffPanel
              leftLabel="Original"
              rightLabel="Revised"
              rows={diffRows}
            />
          )}
        </div>

        <div className="editors" aria-label="Text inputs">
          <label className="editor editor--plain">
            <span className="sr-only">Original text</span>
            <textarea
              ref={leftRef}
              className="editor__field"
              placeholder="Paste one version of a text here."
              value={left}
              onChange={(e) => {
                setLeft(e.target.value)
                setCompared(false)
              }}
              spellCheck={false}
            />
          </label>
          <label className="editor editor--plain">
            <span className="sr-only">Revised text</span>
            <textarea
              ref={rightRef}
              className="editor__field"
              placeholder="Paste another version of the text here."
              value={right}
              onChange={(e) => {
                setRight(e.target.value)
                setCompared(false)
              }}
              spellCheck={false}
            />
          </label>
        </div>

        <fieldset className="options" aria-labelledby={optionsId}>
          <legend id={optionsId} className="options__legend">
            Text options
          </legend>
          <ul className="options__list">
            <li>
              <label className="options__item">
                <input
                  type="checkbox"
                  checked={opts.toLowercase}
                  onChange={() => toggleOption('toLowercase')}
                />
                To lowercase
              </label>
            </li>
            <li>
              <label className="options__item">
                <input
                  type="checkbox"
                  checked={opts.sortLines}
                  onChange={() => toggleOption('sortLines')}
                />
                Sort lines
              </label>
            </li>
            <li>
              <label className="options__item">
                <input
                  type="checkbox"
                  checked={opts.replaceLineBreaksWithSpaces}
                  onChange={() => toggleOption('replaceLineBreaksWithSpaces')}
                />
                Replace line breaks with spaces
              </label>
            </li>
            <li>
              <label className="options__item">
                <input
                  type="checkbox"
                  checked={opts.removeExcessWhitespace}
                  onChange={() => toggleOption('removeExcessWhitespace')}
                />
                Remove excess white space
              </label>
            </li>
          </ul>
        </fieldset>

        <p className="privacy-note">
          Comparison runs in your browser — text is not sent to any server.
        </p>
      </main>

      <footer className="app__footer">
        <span className="app__footer-key" aria-hidden="true">
          ⌨
        </span>
        <nav className="app__footer-links" aria-label="Footer">
          <span>Local React clone inspired by </span>
          <a href="https://text-compare.com/" target="_blank" rel="noreferrer">
            Text Compare!
          </a>
        </nav>
      </footer>
    </div>
  )
}
