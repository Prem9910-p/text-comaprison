import { useMemo, useState } from 'react'

type BarcodeFormat = 'code128' | 'ean13' | 'upc' | 'itf14'

const FORMAT_OPTIONS: Array<{ id: BarcodeFormat; label: string }> = [
  { id: 'code128', label: 'Code 128' },
  { id: 'ean13', label: 'EAN-13' },
  { id: 'upc', label: 'UPC' },
  { id: 'itf14', label: 'ITF-14' },
]

export function BarcodeGeneratorTool() {
  const [value, setValue] = useState('123456789012')
  const [format, setFormat] = useState<BarcodeFormat>('code128')
  const [scale, setScale] = useState(3)
  const [height, setHeight] = useState(20)
  const [showText, setShowText] = useState(true)

  const trimmedValue = value.trim()
  const isEmpty = trimmedValue.length === 0

  const barcodeSrc = useMemo(() => {
    if (!trimmedValue) return ''
    const params = new URLSearchParams({
      bcid: format,
      text: trimmedValue,
      scale: String(scale),
      height: String(height),
      includetext: showText ? 'true' : 'false',
    })
    return `https://bwipjs-api.metafloor.com/?${params.toString()}`
  }, [format, height, scale, showText, trimmedValue])

  return (
    <section className="tool-panel">
      <label className="tool-home__subtitle" htmlFor="barcode-input">
        Enter value
      </label>
      <textarea
        id="barcode-input"
        className="tool-textarea"
        placeholder="Enter product code, ID, or any text..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className="qr-controls">
        <label className="qr-controls__item" htmlFor="barcode-format">
          Barcode format
          <select
            id="barcode-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="qr-controls__item" htmlFor="barcode-scale">
          Scale: {scale}x
          <input
            id="barcode-scale"
            type="range"
            min={1}
            max={6}
            step={1}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>

        <label className="qr-controls__item" htmlFor="barcode-height">
          Height: {height}
          <input
            id="barcode-height"
            type="range"
            min={6}
            max={40}
            step={1}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </label>
      </div>

      <label className="options__item" htmlFor="barcode-show-text">
        <input
          id="barcode-show-text"
          type="checkbox"
          checked={showText}
          onChange={(e) => setShowText(e.target.checked)}
        />
        Show text under barcode
      </label>

      <div className="qr-preview">
        {isEmpty ? (
          <p className="json-message">Enter text to generate a barcode.</p>
        ) : (
          <>
            <img src={barcodeSrc} alt="Generated barcode" loading="lazy" />
            <a href={barcodeSrc} download="barcode.png" className="btn btn--primary">
              Download Barcode
            </a>
          </>
        )}
      </div>
    </section>
  )
}
