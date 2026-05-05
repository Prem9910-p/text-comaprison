import { useCallback, useEffect, useState } from 'react'
import { CaseConverterTool } from './tools/CaseConverterTool'
import { CompareTool } from './tools/CompareTool'
import { DedupeLinesTool } from './tools/DedupeLinesTool'
import { HomeTools } from './tools/HomeTools'
import { JsonFormatterTool } from './tools/JsonFormatterTool'
import { getToolTitle, parseToolFromHash } from './tools/toolConfig'
import type { ToolId } from './tools/types'
import { WordCounterTool } from './tools/WordCounterTool'
import './App.css'

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
  const [activeTool, setActiveTool] = useState<ToolId>(() => {
    if (typeof window === 'undefined') return 'home'
    return parseToolFromHash(window.location.hash)
  })

  const navigateTool = useCallback((tool: ToolId) => {
    setActiveTool(tool)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const nextHash = `#${activeTool}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [activeTool])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onHashChange = () => setActiveTool(parseToolFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const toolTitle = getToolTitle(activeTool)

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
        <h1 className="app__title">{toolTitle}</h1>
      </header>

      <main className="app__main">
        {activeTool !== 'home' && (
          <div className="tool-nav">
            <button type="button" className="btn btn--ghost" onClick={() => navigateTool('home')}>
              ← Back to tools
            </button>
          </div>
        )}

        {activeTool === 'home' && <HomeTools onNavigate={navigateTool} />}
        {activeTool === 'compare' && <CompareTool />}
        {activeTool === 'word-counter' && <WordCounterTool />}
        {activeTool === 'dedupe-lines' && <DedupeLinesTool />}
        {activeTool === 'case-converter' && <CaseConverterTool />}
        {activeTool === 'json-formatter' && <JsonFormatterTool />}

        <p className="privacy-note">
          All tools run in your browser — text is not sent to any server.
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
