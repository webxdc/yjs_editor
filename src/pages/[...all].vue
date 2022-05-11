<script setup lang="ts">
import * as Y from 'yjs'
import { redo, undo, ySyncPlugin } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
// @ts-expect-error 'yeet'
import { exampleSetup } from 'prosemirror-example-setup'
// @ts-expect-error 'yeet'
import { keymap } from 'prosemirror-keymap'
import type { ReceivedStatusUpdate } from 'webxdc'
import { schema } from '~/schema'
import '~/styles/style.css'

const ydoc = new Y.Doc()
const type = ydoc.getXmlFragment('prosemirror')

ydoc.on('update', (update) => {
  window.webxdc.sendUpdate({ payload: { update, sender: window.webxdc.selfAddr } }, 'new state')
})

interface Payload {
  update: any
  sender: string
}

function receiveUpdate(update: ReceivedStatusUpdate<Payload>) {
  // eslint-disable-next-line no-console
  if (update.payload.sender !== window.webxdc.selfAddr)
    Y.applyUpdate(ydoc, update.payload.update)
}


onMounted(() => {
  const editor = document.querySelector('#editor')!

  // @ts-expect-error 'hi'
  const t = new EditorView(editor, {
    state: EditorState.create({
      schema,
      plugins: [
        //yUndoPlugin(),
        ySyncPlugin(type),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ].concat(exampleSetup({ schema })),
    }),
  })
  window.webxdc.setUpdateListener(receiveUpdate, 0)
})
</script>

<template lang="pug">
div
  h1.text-2xl.leading-none.mb-1 Cooperative editing
  div(id="editor")

</template>

<style lang="sass">

table.vgt-table td
  padding: 2px !important

thead
  display: none

.vgt-right-align
  text-align: left !important

.vgt-global-search__input
  padding-left: 5px !important

.magnifying-glass
  display: none !important
</style>
