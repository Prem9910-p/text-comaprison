export type ToolId =
  | 'home'
  | 'compare'
  | 'word-counter'
  | 'dedupe-lines'
  | 'case-converter'
  | 'json-formatter'

export type ToolCard = {
  id: Exclude<ToolId, 'home'>
  name: string
  description: string
}
