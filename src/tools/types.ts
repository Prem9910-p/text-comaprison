export type ToolId =
  | 'home'
  | 'compare'
  | 'word-counter'
  | 'dedupe-lines'
  | 'case-converter'
  | 'json-formatter'
  | 'about-us'
  | 'contact-us'
  | 'privacy-policy'
  | 'terms-and-conditions'

export type ToolCard = {
  id: Exclude<
    ToolId,
    'home' | 'about-us' | 'contact-us' | 'privacy-policy' | 'terms-and-conditions'
  >
  name: string
  description: string
}
