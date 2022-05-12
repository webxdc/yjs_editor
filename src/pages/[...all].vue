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


interface Payload {
  updates: any[]
  sender: string
}

const ydoc = new Y.Doc()
let initialized = false
const type = ydoc.getXmlFragment('prosemirror')

// collect many updates from yjs for debouncing
const updates: Uint8Array[] = []
let timeOut: NodeJS.Timeout


// this gets called every keystroke
ydoc.on('update', (update, _, doc) => {
  
  if (initialized) {
    updates.push(update)
    if (timeOut) {
      clearTimeout(timeOut)
    }    
    timeOut = setTimeout(() => sendUpdate(updates), 1000)
  }
  else{ 
    console.log('skipping resend');
  }
})

// actually sends the collected updates through deltachet
function sendUpdate(updates: Uint8Array[]) {
  console.log('sending update:');
  window.webxdc.sendUpdate({ payload: { updates, sender: window.webxdc.selfAddr }}, '')
}

// saves the state of the editor and last seen serual number to local storage
function saveState(id: number) {
  const state_encoded = Y.encodeStateAsUpdate(ydoc)
  localStorage.setItem('state', JSON.stringify({state: state_encoded}))
  localStorage.setItem('serial', id.toString())
}

// tries to restore state from local storage
function restoreState() {
  const item = localStorage.getItem('state')
  if (item !== null) {
    console.log('restoring state', item)
    const state = JSON.parse(item).state
    Y.applyUpdate(ydoc, state)
  } else {
    throw new Error('no state to restore')
  }
}

// receive an update from another client over deltachat
function receiveUpdate(update: ReceivedStatusUpdate<Payload>) {
  if (update.payload.sender !== window.webxdc.selfAddr){
    console.log('applying update')  
    for (const ydoc_update of update.payload.updates) {
      Y.applyUpdate(ydoc, ydoc_update)
    }
    saveState(update.serial)
  }
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

  const latest_serial = localStorage.getItem('serial')
  if (latest_serial !== null) {
    restoreState()
    window.webxdc.setUpdateListener(receiveUpdate, parseInt(latest_serial)).then(() => {
      initialized = true
    })
  } else {
    window.webxdc.setUpdateListener(receiveUpdate, 0).then(() => {
      initialized = true
    })
  }

})
</script>

<template lang="pug">
div
  div.flex.justify-between
  div(id="editor" class="dark:bg-red")
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
