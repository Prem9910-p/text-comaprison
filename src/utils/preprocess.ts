export type PreprocessOptions = {
  toLowercase: boolean
  sortLines: boolean
  replaceLineBreaksWithSpaces: boolean
  removeExcessWhitespace: boolean
}

export function preprocessText(text: string, opts: PreprocessOptions): string {
  let t = text
  if (opts.toLowercase) {
    t = t.toLowerCase()
  }
  if (opts.sortLines) {
    const lines = t.split(/\r?\n/)
    lines.sort((a, b) => a.localeCompare(b))
    t = lines.join('\n')
  }
  if (opts.replaceLineBreaksWithSpaces) {
    t = t.replace(/\r?\n/g, ' ')
  }
  if (opts.removeExcessWhitespace) {
    t = t.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, '').trim()
  }
  return t
}
