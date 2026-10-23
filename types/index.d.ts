export type CopyItem = { kind: 'code' | 'path' | 'url' | 'text'; text: string }

declare module 'claude-code' {
  interface PluginState {
    'copy-bar': { items: CopyItem[]; copied: string | null }
  }
}
