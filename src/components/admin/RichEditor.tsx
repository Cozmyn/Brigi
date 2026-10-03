'use client'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text'
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $setBlocksType } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical'
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  return (
    <div className="editor-toolbar">
      <button
        type="button"
        title="Aldin"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        title="Cursiv"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        title="Titlu secțiune"
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection))
              $setBlocksType(selection, () => $createHeadingNode('h2'))
          })
        }
      >
        H2
      </button>
      <button
        type="button"
        title="Listă"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        ☷
      </button>
      <button
        type="button"
        title="Legătură"
        onClick={() => {
          const url = prompt('Adresă HTTPS sau cale internă (gol pentru eliminare)')
          if (url !== null && (!url || /^(https:\/\/|\/[^/])/.test(url)))
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null)
        }}
      >
        ↗
      </button>
      <button
        type="button"
        title="Anulează"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        ↶
      </button>
      <button
        type="button"
        title="Refă"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        ↷
      </button>
    </div>
  )
}
export default function RichEditor({
  value,
  onChange,
}: {
  value: unknown
  onChange: (value: unknown) => void
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'BrigittaEditor',
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
        editorState: value ? JSON.stringify(value) : undefined,
        onError: (error) => {
          console.error('Rich-text editor', error.name)
        },
      }}
    >
      <div className="rich-editor">
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="rich-editable" aria-label="Conținut editorial" />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin ignoreSelectionChange onChange={(state) => onChange(state.toJSON())} />
      </div>
    </LexicalComposer>
  )
}
