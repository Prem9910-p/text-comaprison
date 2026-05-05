import { useCallback, useState } from 'react'

export function JsonFormatterTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonMessage, setJsonMessage] = useState('')
  const [jsonMessageType, setJsonMessageType] = useState<'success' | 'error' | 'idle'>(
    'idle',
  )

  const validateJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonMessageType('error')
      setJsonMessage('Enter JSON to validate.')
      return
    }
    try {
      JSON.parse(jsonInput)
      setJsonMessageType('success')
      setJsonMessage('Valid JSON.')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid JSON.'
      setJsonMessageType('error')
      setJsonMessage(msg)
    }
  }, [jsonInput])

  const formatJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonMessageType('error')
      setJsonMessage('Enter JSON to format.')
      return
    }
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setJsonMessageType('success')
      setJsonMessage('JSON formatted successfully.')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid JSON.'
      setJsonMessageType('error')
      setJsonMessage(msg)
    }
  }, [jsonInput])

  const minifyJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonMessageType('error')
      setJsonMessage('Enter JSON to minify.')
      return
    }
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed))
      setJsonMessageType('success')
      setJsonMessage('JSON minified successfully.')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid JSON.'
      setJsonMessageType('error')
      setJsonMessage(msg)
    }
  }, [jsonInput])

  return (
    <section className="tool-panel">
      <div className="tool-actions tool-actions--wrap">
        <button type="button" className="btn btn--primary" onClick={formatJson}>
          Format JSON
        </button>
        <button type="button" className="btn btn--ghost" onClick={minifyJson}>
          Minify JSON
        </button>
        <button type="button" className="btn btn--ghost" onClick={validateJson}>
          Validate JSON
        </button>
      </div>
      <textarea
        className="tool-textarea tool-textarea--code"
        placeholder='Paste JSON here, for example: {"name":"Raj"}'
        value={jsonInput}
        onChange={(e) => {
          setJsonInput(e.target.value)
          setJsonMessage('')
          setJsonMessageType('idle')
        }}
        spellCheck={false}
      />
      {jsonMessage && (
        <p className={`json-message json-message--${jsonMessageType}`}>{jsonMessage}</p>
      )}
    </section>
  )
}
