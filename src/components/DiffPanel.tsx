import { Fragment, useMemo, type ReactNode } from 'react'
import { diffLines, diffWordsWithSpace } from 'diff'
import './DiffPanel.css'

/** Side-by-side row after merging adjacent delete+insert blocks into line substitutions. */
export type DiffRow =
  | { mode: 'same'; text: string }
  | { mode: 'removed-only'; left: string }
  | { mode: 'added-only'; right: string }
  | { mode: 'modified'; left: string; right: string }

type FlatLine =
  | { t: 'same'; line: string }
  | { t: 'rem'; line: string }
  | { t: 'add'; line: string }

const MODIFIED_LINE_SIMILARITY_THRESHOLD = 0.34

function splitLines(value: string): string[] {
  if (value === '') return []
  const core = value.endsWith('\n') ? value.slice(0, -1) : value
  return core.length === 0 ? [''] : core.split('\n')
}

function flatFromDiffLines(leftText: string, rightText: string): FlatLine[] {
  const parts = diffLines(leftText, rightText)
  const out: FlatLine[] = []
  for (const part of parts) {
    const lines = splitLines(part.value)
    for (const line of lines) {
      if (part.added) out.push({ t: 'add', line })
      else if (part.removed) out.push({ t: 'rem', line })
      else out.push({ t: 'same', line })
    }
  }
  return out
}

function lineSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  const n = a.length
  const m = b.length
  const prev = new Array<number>(m + 1).fill(0)
  const cur = new Array<number>(m + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a.charCodeAt(i - 1) === b.charCodeAt(j - 1)) {
        cur[j] = prev[j - 1] + 1
      } else {
        cur[j] = prev[j] > cur[j - 1] ? prev[j] : cur[j - 1]
      }
    }
    for (let j = 0; j <= m; j++) {
      prev[j] = cur[j]
      cur[j] = 0
    }
  }

  const lcs = prev[m]
  return (2 * lcs) / (n + m)
}

function alignRemovedAndAdded(
  removed: { t: 'rem'; line: string }[],
  added: { t: 'add'; line: string }[],
): DiffRow[] {
  const n = removed.length
  const m = added.length
  const score = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  const action = Array.from({ length: n + 1 }, () => new Array<'pair' | 'up' | 'left' | null>(m + 1).fill(null))

  for (let i = 1; i <= n; i++) {
    action[i][0] = 'up'
  }
  for (let j = 1; j <= m; j++) {
    action[0][j] = 'left'
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = lineSimilarity(removed[i - 1].line, added[j - 1].line)
      const pairScore =
        sim >= MODIFIED_LINE_SIMILARITY_THRESHOLD
          ? score[i - 1][j - 1] + sim
          : Number.NEGATIVE_INFINITY
      const upScore = score[i - 1][j]
      const leftScore = score[i][j - 1]

      if (pairScore >= upScore && pairScore >= leftScore) {
        score[i][j] = pairScore
        action[i][j] = 'pair'
      } else if (upScore >= leftScore) {
        score[i][j] = upScore
        action[i][j] = 'up'
      } else {
        score[i][j] = leftScore
        action[i][j] = 'left'
      }
    }
  }

  const reversed: DiffRow[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    const step = action[i][j]
    if (step === 'pair' && i > 0 && j > 0) {
      reversed.push({
        mode: 'modified',
        left: removed[i - 1].line,
        right: added[j - 1].line,
      })
      i--
      j--
      continue
    }
    if (step === 'up' && i > 0) {
      reversed.push({ mode: 'removed-only', left: removed[i - 1].line })
      i--
      continue
    }
    if (j > 0) {
      reversed.push({ mode: 'added-only', right: added[j - 1].line })
      j--
      continue
    }
    if (i > 0) {
      reversed.push({ mode: 'removed-only', left: removed[i - 1].line })
      i--
    }
  }

  return reversed.reverse()
}

function mergeToRows(flat: FlatLine[]): DiffRow[] {
  const rows: DiffRow[] = []
  let i = 0
  while (i < flat.length) {
    const cur = flat[i]
    if (cur.t === 'rem') {
      let j = i
      while (j < flat.length && flat[j].t === 'rem') j++
      let k = j
      while (k < flat.length && flat[k].t === 'add') k++
      const rem = flat.slice(i, j) as { t: 'rem'; line: string }[]
      const add = flat.slice(j, k) as { t: 'add'; line: string }[]
      rows.push(...alignRemovedAndAdded(rem, add))
      i = k
    } else if (cur.t === 'add') {
      rows.push({ mode: 'added-only', right: cur.line })
      i++
    } else {
      rows.push({ mode: 'same', text: cur.line })
      i++
    }
  }
  return rows
}

function diffStats(rows: DiffRow[]) {
  let added = 0
  let removed = 0
  let unchanged = 0
  for (const r of rows) {
    if (r.mode === 'same') unchanged += 1
    if (r.mode === 'added-only') added += 1
    if (r.mode === 'removed-only') removed += 1
    if (r.mode === 'modified') {
      added += 1
      removed += 1
    }
  }
  return { added, removed, unchanged }
}

type AnnotatedRow = {
  row: DiffRow
  leftLn: number | null
  rightLn: number | null
}

function annotateLineNumbers(rows: DiffRow[]): AnnotatedRow[] {
  let lnL = 1
  let lnR = 1
  const out: AnnotatedRow[] = []
  for (const row of rows) {
    switch (row.mode) {
      case 'same':
      case 'modified':
        out.push({ row, leftLn: lnL++, rightLn: lnR++ })
        break
      case 'removed-only':
        out.push({ row, leftLn: lnL++, rightLn: null })
        break
      case 'added-only':
        out.push({ row, leftLn: null, rightLn: lnR++ })
        break
    }
  }
  return out
}

export function buildDiffRows(leftText: string, rightText: string): DiffRow[] {
  return mergeToRows(flatFromDiffLines(leftText, rightText))
}

function WordDiffSpans({
  oldStr,
  newStr,
  side,
}: {
  oldStr: string
  newStr: string
  side: 'left' | 'right'
}) {
  const parts = diffWordsWithSpace(oldStr, newStr)
  const nodes: ReactNode[] = []
  let key = 0
  for (const part of parts) {
    if (part.added) {
      if (side === 'right') {
        nodes.push(
          <span key={key++} className="diff-word diff-word--token diff-word--added">
            {part.value}
          </span>,
        )
      }
      continue
    }
    if (part.removed) {
      if (side === 'left') {
        nodes.push(
          <span key={key++} className="diff-word diff-word--token diff-word--removed">
            {part.value}
          </span>,
        )
      }
      continue
    }
    nodes.push(
      <span key={key++} className="diff-word diff-word--plain">
        {part.value}
      </span>,
    )
  }
  return (
    <span className="diff-table__line diff-table__line--words">
      {nodes.length > 0 ? nodes : '\u00a0'}
    </span>
  )
}

function LineNum({ n }: { n: number | null }) {
  if (n == null) {
    return <span className="diff-ln diff-ln--empty">&nbsp;</span>
  }
  return <span className="diff-ln">{n}</span>
}

function Gutter({ kind }: { kind: 'none' | 'modified' | 'removed' | 'added' }) {
  return (
    <td className={`diff-gutter diff-gutter--${kind}`} aria-hidden="true">
      {kind === 'modified' && (
        <>
          <span className="diff-gutter__bar" />
          <span className="diff-gutter__arrow diff-gutter__arrow--up">▲</span>
        </>
      )}
      {kind === 'removed' && (
        <>
          <span className="diff-gutter__bar diff-gutter__bar--del" />
          <span className="diff-gutter__mark diff-gutter__mark--del">−</span>
        </>
      )}
      {kind === 'added' && (
        <>
          <span className="diff-gutter__bar diff-gutter__bar--add" />
          <span className="diff-gutter__mark diff-gutter__mark--add">+</span>
        </>
      )}
    </td>
  )
}

type Props = {
  leftLabel: string
  rightLabel: string
  rows: DiffRow[]
}

export function DiffPanel({ leftLabel, rightLabel, rows }: Props) {
  const stats = useMemo(() => diffStats(rows), [rows])
  const annotated = useMemo(() => annotateLineNumbers(rows), [rows])

  if (rows.length === 0) {
    return (
      <div className="diff-panel diff-panel--empty">
        <p>No differences — texts match (after preprocessing).</p>
      </div>
    )
  }

  return (
    <div className="diff-panel diff-panel--ide" role="region" aria-label="Comparison result">
      <div className="diff-panel__bar">
        <div className="diff-panel__bar-main">
          <h2 className="diff-panel__title">Comparison result</h2>
          <p className="diff-panel__subtitle">
            Line numbers, gutter markers, and blue highlights for inline edits (IDE-style).
          </p>
        </div>
        <ul className="diff-panel__stats" aria-label="Change summary">
          <li className="diff-stat diff-stat--removed">
            <span className="diff-stat__label">Removed</span>
            <span className="diff-stat__value">{stats.removed}</span>
          </li>
          <li className="diff-stat diff-stat--added">
            <span className="diff-stat__label">Added</span>
            <span className="diff-stat__value">{stats.added}</span>
          </li>
          <li className="diff-stat diff-stat--same">
            <span className="diff-stat__label">Unchanged</span>
            <span className="diff-stat__value">{stats.unchanged}</span>
          </li>
        </ul>
      </div>

      <div className="diff-panel__body">
        <div className="diff-panel__scroll">
          <div className="diff-panel__headers diff-panel__headers--ide">
            <div className="diff-header-pane diff-header-pane--left">
              <span className="diff-header-ln">Ln</span>
              <span className="diff-header-gutter" title="Changes">
                <span className="diff-header-gutter__nav">▼</span>
              </span>
              <span className="diff-header-code">{leftLabel}</span>
            </div>
            <div className="diff-header-pane diff-header-pane--right">
              <span className="diff-header-ln">Ln</span>
              <span className="diff-header-gutter">
                <span className="diff-header-gutter__nav">▼</span>
              </span>
              <span className="diff-header-code">{rightLabel}</span>
            </div>
          </div>

          <table className="diff-table diff-table--ide">
            <tbody>
              {annotated.map(({ row, leftLn, rightLn }, i) => (
                <Fragment key={i}>
                  {row.mode === 'same' && (
                    <tr className="diff-table__row diff-table__row--same">
                      <td className="diff-table__ln">
                        <LineNum n={leftLn} />
                      </td>
                      <Gutter kind="none" />
                      <td className="diff-table__code diff-table__code--same">
                        <span className="diff-table__line">{row.text}</span>
                      </td>
                      <td className="diff-table__ln">
                        <LineNum n={rightLn} />
                      </td>
                      <Gutter kind="none" />
                      <td className="diff-table__code diff-table__code--same">
                        <span className="diff-table__line">{row.text}</span>
                      </td>
                    </tr>
                  )}
                  {row.mode === 'modified' && (
                    <tr className="diff-table__row diff-table__row--modified">
                      <td className="diff-table__ln">
                        <LineNum n={leftLn} />
                      </td>
                      <Gutter kind="modified" />
                      <td className="diff-table__code diff-table__code--modified">
                        <WordDiffSpans
                          oldStr={row.left}
                          newStr={row.right}
                          side="left"
                        />
                      </td>
                      <td className="diff-table__ln">
                        <LineNum n={rightLn} />
                      </td>
                      <Gutter kind="modified" />
                      <td className="diff-table__code diff-table__code--modified">
                        <WordDiffSpans
                          oldStr={row.left}
                          newStr={row.right}
                          side="right"
                        />
                      </td>
                    </tr>
                  )}
                  {row.mode === 'removed-only' && (
                    <tr className="diff-table__row diff-table__row--removed">
                      <td className="diff-table__ln">
                        <LineNum n={leftLn} />
                      </td>
                      <Gutter kind="removed" />
                      <td className="diff-table__code diff-table__code--removed">
                        <span className="diff-table__line">{row.left}</span>
                      </td>
                      <td className="diff-table__ln">
                        <LineNum n={rightLn} />
                      </td>
                      <Gutter kind="none" />
                      <td className="diff-table__code diff-table__code--gap">
                        <span className="diff-table__line" />
                      </td>
                    </tr>
                  )}
                  {row.mode === 'added-only' && (
                    <tr className="diff-table__row diff-table__row--added">
                      <td className="diff-table__ln">
                        <LineNum n={leftLn} />
                      </td>
                      <Gutter kind="none" />
                      <td className="diff-table__code diff-table__code--gap">
                        <span className="diff-table__line" />
                      </td>
                      <td className="diff-table__ln">
                        <LineNum n={rightLn} />
                      </td>
                      <Gutter kind="added" />
                      <td className="diff-table__code diff-table__code--added">
                        <span className="diff-table__line">{row.right}</span>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
