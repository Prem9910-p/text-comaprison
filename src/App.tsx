import { useCallback, useEffect, useState } from 'react'
import { Base64Tool } from './tools/Base64Tool'
import { BarcodeGeneratorTool } from './tools/BarcodeGeneratorTool'
import { CaseConverterTool } from './tools/CaseConverterTool'
import { CompareTool } from './tools/CompareTool'
import { DedupeLinesTool } from './tools/DedupeLinesTool'
import { HomeTools } from './tools/HomeTools'
import { JsonFormatterTool } from './tools/JsonFormatterTool'
import { QrCodeGeneratorTool } from './tools/QrCodeGeneratorTool'
import { TypingTestTool } from './tools/TypingTestTool'
import {
  getPathForTool,
  getToolTitle,
  parseToolFromHash,
  parseToolFromPath,
} from './tools/toolConfig'
import type { ToolId } from './tools/types'
import { WordCounterTool } from './tools/WordCounterTool'
import './App.css'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined
const ADSENSE_TOP_SLOT = import.meta.env.VITE_ADSENSE_TOP_SLOT_ID as string | undefined
const ADSENSE_BOTTOM_SLOT = import.meta.env.VITE_ADSENSE_BOTTOM_SLOT_ID as string | undefined
const VIDEO_AD_URL = import.meta.env.VITE_VIDEO_AD_URL as string | undefined

type SeoEntry = {
  title: string
  description: string
  keywords: string
}

const SEO_BY_PAGE: Record<ToolId, SeoEntry> = {
  home: {
    title: 'Text Utilities - Compare, Count, Convert and Format Online',
    description:
      'Use free text utilities online: compare two texts, count words, remove duplicate lines, convert text case, and format JSON in your browser.',
    keywords:
      'text utilities, text tools online, text compare tool, compare two texts, word counter, duplicate line remover, case converter, json formatter',
  },
  compare: {
    title: 'Text Compare Tool - Compare Two Texts Side by Side',
    description:
      'Compare two texts side by side with clear line and word differences. Fast browser-based text compare tool with privacy-focused processing.',
    keywords:
      'text compare, compare two texts, text diff checker, side by side diff, document comparison tool, online diff tool',
  },
  'word-counter': {
    title: 'Word Counter - Count Words, Characters, Lines and Paragraphs',
    description:
      'Count words, characters, lines, and paragraphs instantly with this free online word counter tool for writing and editing.',
    keywords:
      'word counter, character counter, line counter, paragraph counter, online word count tool, text analysis tool',
  },
  'dedupe-lines': {
    title: 'Remove Duplicate Lines - Unique Line Cleaner',
    description:
      'Remove duplicate lines from text while preserving order. Clean repeated content quickly with this free duplicate line remover.',
    keywords:
      'remove duplicate lines, dedupe lines tool, unique lines generator, text cleaner, remove repeated text lines',
  },
  'case-converter': {
    title: 'Case Converter - Uppercase, Lowercase, Title and Sentence Case',
    description:
      'Convert text to uppercase, lowercase, title case, sentence case, or toggle case instantly with this free online case converter.',
    keywords:
      'case converter, uppercase converter, lowercase converter, title case converter, sentence case converter, toggle case tool',
  },
  'json-formatter': {
    title: 'JSON Formatter and Validator - Beautify and Minify JSON',
    description:
      'Validate, beautify, and minify JSON quickly in your browser using this free JSON formatter and validator tool.',
    keywords:
      'json formatter, json validator, json beautifier, json minifier, pretty print json, format json online',
  },
  'typing-test': {
    title: 'Typing Test - Check Typing Speed and Accuracy',
    description:
      'Take a free 60-second typing test to measure words per minute and typing accuracy in your browser.',
    keywords:
      'typing test, typing speed test, typing accuracy test, wpm test, online typing practice, free typing tool',
  },
  'qr-code-generator': {
    title: 'QR Code Generator - Create and Download QR Codes',
    description:
      'Generate QR codes instantly from URLs or text and download them as images with this free QR code generator.',
    keywords:
      'qr code generator, create qr code, free qr generator, qr code for url, download qr code image, online qr maker',
  },
  base64: {
    title: 'Base64 Encode Decode Tool - Convert Text and Base64',
    description:
      'Encode text into Base64 and decode Base64 back to plain text instantly with this free browser-based Base64 converter.',
    keywords:
      'base64 encode, base64 decode, base64 converter, text to base64, base64 to text, online base64 tool',
  },
  'barcode-generator': {
    title: 'Barcode Generator - Create and Download Barcode Images',
    description:
      'Generate barcodes online in Code 128, EAN-13, UPC, and ITF-14 formats and download them instantly.',
    keywords:
      'barcode generator, create barcode online, code 128 generator, ean13 barcode, upc barcode generator, download barcode image',
  },
  'about-us': {
    title: 'About Us - Text Utilities Project',
    description:
      'Learn about the Text Utilities project and the privacy-focused text tools built to help writers, students, and developers.',
    keywords:
      'about text utilities, text compare project, online text tools platform, privacy focused text tools',
  },
  'contact-us': {
    title: 'Contact Us - Text Utilities Support and Feedback',
    description:
      'Contact Text Utilities for support, bug reports, and feature requests for text compare and other text processing tools.',
    keywords:
      'contact text utilities, text tool support, report issue text compare, feature request text tools',
  },
  'privacy-policy': {
    title: 'Privacy Policy - Text Utilities',
    description:
      'Read the privacy policy for Text Utilities and understand how text is processed locally in your browser.',
    keywords:
      'privacy policy text tools, text compare privacy, browser based text processing, local text processing privacy',
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions - Text Utilities',
    description:
      'Read the terms and conditions for using Text Utilities and its online text comparison and formatting tools.',
    keywords:
      'terms and conditions text tools, text compare terms, online utility terms of use',
  },
}

function setMetaContent(name: string, content: string) {
  const meta = document.querySelector(`meta[name="${name}"]`)
  if (meta) {
    meta.setAttribute('content', content)
    return
  }
  const created = document.createElement('meta')
  created.setAttribute('name', name)
  created.setAttribute('content', content)
  document.head.appendChild(created)
}

function setPropertyMetaContent(property: string, content: string) {
  const meta = document.querySelector(`meta[property="${property}"]`)
  if (meta) {
    meta.setAttribute('content', content)
    return
  }
  const created = document.createElement('meta')
  created.setAttribute('property', property)
  created.setAttribute('content', content)
  document.head.appendChild(created)
}

function AdSlot({ slot, className }: { slot?: string; className?: string }) {
  const canRenderAds = Boolean(ADSENSE_CLIENT && slot)

  useEffect(() => {
    if (!canRenderAds) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Ignore push errors to prevent UI crashes when ad blockers are enabled.
    }
  }, [canRenderAds, slot])

  if (!canRenderAds) {
    return (
      <aside className={`ad-slot ${className ?? ''}`} aria-label="Advertisement">
        <p className="ad-slot__fallback">Ad space</p>
      </aside>
    )
  }

  return (
    <aside className={`ad-slot ${className ?? ''}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}

function VideoAdSlot({ className }: { className?: string }) {
  const videoUrl = VIDEO_AD_URL?.trim()

  if (!videoUrl) {
    return (
      <aside className={`video-ad ${className ?? ''}`} aria-label="Video advertisement">
        <p className="ad-slot__fallback">Video ad space</p>
      </aside>
    )
  }

  return (
    <aside className={`video-ad ${className ?? ''}`} aria-label="Video advertisement">
      <div className="video-ad__frame">
        <iframe
          src={videoUrl}
          title="Sponsored video"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </aside>
  )
}

function InfoPage({ page }: { page: ToolId }) {
  if (page === 'about-us') {
    return (
      <section className="info-page">
        <h2>About Us</h2>
        <p>
          This project is a fast, privacy-focused set of text tools built for daily writing and
          developer workflows. You can compare text, count words, remove duplicate lines, convert
          case, and format JSON from one place.
        </p>
        <p>
          Every tool is designed to be simple, clean, and instant, so you can finish text tasks
          without switching between multiple websites.
        </p>
      </section>
    )
  }

  if (page === 'contact-us') {
    return (
      <section className="info-page">
        <h2>Contact Us</h2>
        <p>
          Have a suggestion, bug report, or feature request for these text utilities? We would love
          to hear from you.
        </p>
        <p>
          Email: <a href="mailto:prem60866@gmail.com">prem60866@gmail.com</a>
        </p>
        <p>
          Please include the tool name and a short example so we can reproduce your issue quickly.
        </p>
      </section>
    )
  }

  if (page === 'privacy-policy') {
    return (
      <section className="info-page">
        <h2>Privacy Policy</h2>
        <p>
          Privacy Policy

Your privacy is important to us. This website is designed to provide fast and privacy-friendly text utilities for users.

Most text processing happens directly in your browser, and we do not permanently store the text you enter on our servers.

We may store limited browser data such as theme preference (dark/light mode) using local storage to improve user experience.

This website may use third-party services such as Google AdSense and analytics tools that may use cookies to personalize ads, analyze traffic, and improve services.

Google and its partners may use cookies to serve ads based on your visit to this and other websites. Users may opt out of personalized advertising by visiting Google Ads Settings.

No account registration is required to use the tools, and we do not intentionally collect sensitive personal information.

By using this website, you agree to this privacy policy.
        </p>
        
      </section>
    )
  }

  return (
    <section className="info-page">
      <h2>Terms &amp; Conditions</h2>
      <p>
By using this website and its tools, you agree to these terms and conditions.

All tools and services are provided on an "as is" and "as available" basis without warranties of any kind. While we aim to provide accurate and reliable results, we do not guarantee the completeness, accuracy, or reliability of any generated output.

Users are responsible for reviewing and verifying all output before using it in important documents, projects, or production systems.

You agree not to misuse the website, attempt to disrupt services, upload malicious content, or use the platform for unlawful activities.

We may update, modify, or discontinue tools and features at any time without prior notice.

This website may display third-party advertisements and links, including Google AdSense ads.

By continuing to use this website, you accept these terms and conditions.
      </p>
    </section>
  )
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
  const [activeTool, setActiveTool] = useState<ToolId>(() => {
    if (typeof window === 'undefined') return 'home'
    const fromPath = parseToolFromPath(window.location.pathname)
    if (fromPath !== 'home' || window.location.pathname === '/') return fromPath
    return parseToolFromHash(window.location.hash)
  })

  const navigateTool = useCallback((tool: ToolId) => {
    if (typeof window !== 'undefined') {
      const nextPath = getPathForTool(tool)
      if (window.location.pathname !== nextPath) {
        window.history.pushState(null, '', nextPath)
      }
    }
    setActiveTool(tool)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const nextPath = getPathForTool(activeTool)
    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.replaceState(null, '', nextPath)
    }
  }, [activeTool])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPopState = () => setActiveTool(parseToolFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const seo = SEO_BY_PAGE[activeTool]
    document.title = `${seo.title} | Free Text And Tools`
    setMetaContent('description', seo.description)
    setMetaContent('keywords', seo.keywords)
    setPropertyMetaContent('og:title', `${seo.title} | Free Text And Tools`)
    setPropertyMetaContent('og:description', seo.description)
    setMetaContent('twitter:title', `${seo.title} | Free Text And Tools`)
    setMetaContent('twitter:description', seo.description)
  }, [activeTool])

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
        <AdSlot slot={ADSENSE_TOP_SLOT} className="ad-slot--top" />

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
        {activeTool === 'typing-test' && <TypingTestTool />}
        {activeTool === 'qr-code-generator' && <QrCodeGeneratorTool />}
        {activeTool === 'base64' && <Base64Tool />}
        {activeTool === 'barcode-generator' && <BarcodeGeneratorTool />}
        {(activeTool === 'about-us' ||
          activeTool === 'contact-us' ||
          activeTool === 'privacy-policy' ||
          activeTool === 'terms-and-conditions') && <InfoPage page={activeTool} />}

        <VideoAdSlot className="video-ad--inline" />

        <p className="privacy-note">
          All tools run in your browser — text is not sent to any server.
        </p>

        <AdSlot slot={ADSENSE_BOTTOM_SLOT} className="ad-slot--bottom" />
      </main>

      <footer className="app__footer">
        <nav className="app__footer-links" aria-label="Footer">
          <button type="button" className="app__footer-link" onClick={() => navigateTool('about-us')}>
            About Us
          </button>
          <button
            type="button"
            className="app__footer-link"
            onClick={() => navigateTool('contact-us')}
          >
            Contact Us
          </button>
          <button
            type="button"
            className="app__footer-link"
            onClick={() => navigateTool('privacy-policy')}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className="app__footer-link"
            onClick={() => navigateTool('terms-and-conditions')}
          >
            Terms &amp; Conditions
          </button>
        </nav>
      </footer>
    </div>
  )
}
