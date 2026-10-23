import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderSurface } from 'claude-code'

import type { CopyItem } from '../types'
import { extractItems, labelFor, splitSegments } from './extract'

const items = atom({ plugin: 'copy-bar', key: 'items' } as const, [] as CopyItem[])
const copied = atom({ plugin: 'copy-bar', key: 'copied' } as const, null as string | null)

async function copy($: EngineInterface, text: string, surface?: RenderSurface) {
  const result = await $.ui.copy({ text, surface })
  if (!result.isCopied) {
    await $.process.run(['pbcopy'], { stdin: text })
  }
  await update($, copied, () => text)
  $.ui.toast('Copiado')
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId) return result
    const found = extractItems(e.answer)
    await update($, items, () => found)
    await update($, copied, () => null)
    return result
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'cp', description: 'Copy item N from the copy bar (/cp 2)' })
    return next(e)
  })

  on('command.run', { command: 'cp' }, async ($, e) => {
    const list = await read($, items)
    const n = Number.parseInt(e.args.trim() || '1', 10)
    const item = list[n - 1]
    if (!item) return { text: list.length ? `Elegí entre 1 y ${list.length}` : 'No hay nada para copiar' }
    await copy($, item.text)
    return { text: `Copiado: ${labelFor(item)}` }
  })

  // Code blocks and URLs in a reply copy on a plain click, with nothing drawn
  // for them: a code block becomes a borderless button, a URL press copies
  // instead of opening (cmd+click still opens). Inline code stays as drawn:
  // a link rewrite shows its href in terminals without OSC 8 links.
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.props.isSummary) return next(e)
    const segments = splitSegments(e.props.text)
    const hasCode = segments.some(seg => seg.kind === 'code')
    if (!hasCode && !/https?:\/\//.test(e.props.text)) return next(e)

    const { Box, Button, Markdown, Text } = $.ui.resolve(e)
    const onLink = (link: { href: string }, press: { surface: RenderSurface }) =>
      copy($, link.href, press.surface)

    return (
      <Box flexDirection="row">
        <Text>{e.props.isFirstOfReply ? '● ' : '  '}</Text>
        <Box flexDirection="column" flexShrink={1}>
          {segments.map((seg, i) =>
            seg.kind === 'code' ? (
              <Box key={`code:${i}`} paddingLeft={2} marginY={1}>
                <Button key={`code:${i}`} plain onPress={press => copy($, seg.text, press.surface)}>
                  <Text color="blue">{seg.text}</Text>
                </Button>
              </Box>
            ) : (
              <Markdown key={`md:${i}`} text={seg.text} onLinkPress={onLink} />
            ),
          )}
        </Box>
      </Box>
    )
  })
}
