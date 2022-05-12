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
import { Schema } from 'prosemirror-model'
import type { Ref } from 'vue'
import {toggleDark} from '~/composables/dark'

interface Payload {
  updates: any[]
  sender: string
}

const ydoc = new Y.Doc()
let prosemirror: EditorView<Schema<"blockquote" | "text" | "doc" | "paragraph" | "heading" | "hard_break", "code" | "em" | "strong" | "ychange">>
const type = ydoc.getXmlFragment('prosemirror')

let initialized = false
let skip_sending = false
const unique_id = window.webxdc.selfAddr + Date.now()

// collect many updates from yjs for debouncing
const updates: Ref<Uint8Array[]> = ref([])
const DEBOUNCE_TIME = 5000 // this is 10 secs
let timeOut: NodeJS.Timeout

// this gets called on every keystroke
ydoc.on('update', (update, _, doc) => {
  if (initialized && !skip_sending) {
    updates.value.push(update)
    if (timeOut) {
      clearTimeout(timeOut)
    }
    timeOut = setTimeout(sendUpdate, DEBOUNCE_TIME)
  }
  else {
    console.log('skipping resend');
  };
  skip_sending = false
})

// actually sends the collected updates with deltachet
function sendUpdate() {
  console.log('sending update:');
  window.webxdc.sendUpdate({
    payload: {
      updates: updates.value,
      sender:
        unique_id
    },
    summary: prosemirror.state.doc.content.firstChild!.textContent
  },
    '')
  updates.value = []
}

// saves the state of the editor and last seen serial number to local storage
function saveState(id: number) {
  console.log('saving state');
  const state_encoded = Y.encodeStateAsUpdate(ydoc)
  localStorage.setItem('state', JSON.stringify({ state: state_encoded }))
  localStorage.setItem('serial', id.toString())
}

// tries to restore state from local storage
function restoreState() {
  const item = localStorage.getItem('state')
  if (item !== null) {
    const state = JSON.parse(item).state
    Y.applyUpdate(ydoc, state)
  } else {
    throw new Error('no state to restore')
  }
}

// receive an update from another client over deltachat
function receiveUpdate(update: ReceivedStatusUpdate<Payload>) {
  if (update.payload.sender !== unique_id) {
    console.log('applying update')
    for (const ydoc_update of update.payload.updates) {
      skip_sending = true
      Y.applyUpdate(ydoc, ydoc_update)
    }
  }
  saveState(update.serial)
}

let menuBarRef = ref()
onMounted(() => {

  const editor = document.querySelector('#editor')!
  // @ts-expect-error 'hi'
  prosemirror = new EditorView(editor, {
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

  menuBarRef.value = document.getElementsByClassName('ProseMirror-menubar')[0]

  window.addEventListener("unload", () => {
    if (updates.value.length > 0) {
      console.log('automatic sending of queued updates before close');
      sendUpdate()
    }
  })

  const latest_serial = localStorage.getItem('serial')
  console.log('latest serial', latest_serial)
  if (latest_serial !== null) {
    console.log('restoring state');

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
  div(id="editor" class="dark:bg-red")
  teleport(v-if="menuBarRef" :to="menuBarRef" )
    span.float-right.flex.items-center.h-full
      transition-group
        button.mr-2.bg-gray-200.rounded.leading-none.p-1#sync(key="1" v-if="updates.length != 0" @click="sendUpdate") sync
        button(@click="() => toggleDark()" key="2")
          div(i="carbon-sun dark:carbon-moon")
</template>

<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>