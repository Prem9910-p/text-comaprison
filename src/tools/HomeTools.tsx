import { toolCards } from './toolConfig'
import type { ToolId } from './types'

type Props = {
  onNavigate: (tool: ToolId) => void
}

export function HomeTools({ onNavigate }: Props) {
  return (
    <section className="tool-home" aria-label="Tool list">
      <p className="tool-home__subtitle">Choose a tool to open its page.</p>
      <div className="tool-grid">
        {toolCards.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="tool-card"
            onClick={() => onNavigate(tool.id)}
          >
            <span className="tool-card__name">{tool.name}</span>
            <span className="tool-card__desc">{tool.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
