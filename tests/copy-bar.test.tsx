import { expect, test } from 'claude-code/testing'

const REPLY = [
  'Probá esto:',
  '```',
  'herdr server reload-config',
  '```',
  'La ruta es `~/.config/herdr/config.toml`, apretá `ctrl+x`; doc https://herdr.dev/docs/keyboard.',
].join('\n')

const MESSAGE = {
  plugin: 'copy-bar',
  component: 'AssistantMessage',
  props: { text: REPLY, isFirstOfReply: true },
} as const

test('a click on a code block or a URL copies it', async ($, on) => {
  const copies: string[] = []
  on('ui.copy', (_, e) => {
    copies.push(e.text)
    return { value: { isCopied: true } }
  })
  on('ui.toast', () => ({ value: undefined }))

  const ui = await $.ui.mount({ ...MESSAGE, surface: 'terminal' } as never)
  await ui.press({ key: 'code:1' })
  const prose = await ui.find({ type: 'Markdown', key: 'md:2' })
  expect(prose?.props.text).toContain('`~/.config/herdr/config.toml`,')
  await ui.press({ key: 'md:2', link: { href: 'https://herdr.dev/docs/keyboard' } } as never)
  expect(copies).toEqual(['herdr server reload-config', 'https://herdr.dev/docs/keyboard'])
  await ui.unmount()
})
