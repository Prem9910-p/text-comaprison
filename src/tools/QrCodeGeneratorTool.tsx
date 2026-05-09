import { useMemo, useState } from 'react'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export function QrCodeGeneratorTool() {
  const [value, setValue] = useState('https://example.com')
  const [size, setSize] = useState(220)
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('M')
  const [foregroundColor, setForegroundColor] = useState('#111111')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [enableCenterLogo, setEnableCenterLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  const trimmedValue = value.trim()
  const trimmedLogoUrl = logoUrl.trim()
  const isEmpty = trimmedValue.length === 0

  const qrSrc = useMemo(() => {
    if (!trimmedValue) return ''
    const dark = foregroundColor.replace('#', '')
    const light = backgroundColor.replace('#', '')
    const params = new URLSearchParams({
      text: trimmedValue,
      size: String(size),
      ecLevel: errorCorrection,
      dark,
      light,
      format: 'png',
    })
    if (enableCenterLogo && trimmedLogoUrl) {
      params.set('centerImageUrl', trimmedLogoUrl)
    }
    return `https://quickchart.io/qr?${params.toString()}`
  }, [
    backgroundColor,
    enableCenterLogo,
    errorCorrection,
    foregroundColor,
    size,
    trimmedLogoUrl,
    trimmedValue,
  ])

  return (
    <section className="tool-panel">
      <label className="tool-home__subtitle" htmlFor="qr-input">
        Enter text or URL
      </label>
      <textarea
        id="qr-input"
        className="tool-textarea"
        placeholder="Type URL, text, phone number, or any content..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className="tool-actions tool-actions--wrap">
        <label htmlFor="qr-size">QR size: {size}px</label>
        <input
          id="qr-size"
          type="range"
          min={120}
          max={420}
          step={10}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div className="qr-controls">
        <label className="qr-controls__item" htmlFor="qr-ecc">
          Error correction
          <select
            id="qr-ecc"
            value={errorCorrection}
            onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
          >
            <option value="L">L (Low)</option>
            <option value="M">M (Medium)</option>
            <option value="Q">Q (Quartile)</option>
            <option value="H">H (High)</option>
          </select>
        </label>

        <label className="qr-controls__item" htmlFor="qr-foreground">
          Foreground color
          <input
            id="qr-foreground"
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
          />
        </label>

        <label className="qr-controls__item" htmlFor="qr-background">
          Background color
          <input
            id="qr-background"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </label>
      </div>

      <label className="options__item" htmlFor="qr-logo-toggle">
        <input
          id="qr-logo-toggle"
          type="checkbox"
          checked={enableCenterLogo}
          onChange={(e) => setEnableCenterLogo(e.target.checked)}
        />
        Enable center logo style
      </label>

      {enableCenterLogo && (
        <input
          className="tool-textarea"
          style={{ minHeight: 'auto' }}
          placeholder="Enter logo image URL (https://...)"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      )}

      <div className="qr-preview">
        {isEmpty ? (
          <p className="json-message">Enter text to generate a QR code.</p>
        ) : (
          <>
            <img src={qrSrc} alt="Generated QR code" width={size} height={size} loading="lazy" />
            <a href={qrSrc} download="qr-code.png" className="btn btn--primary">
              Download QR
            </a>
          </>
        )}
      </div>
    </section>
  )
}
