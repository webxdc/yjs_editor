//@ts-check
import * as Y from 'yjs'
import { redo, undo, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { schema } from './schema'
import './styles/main.css'
import './styles/style.css'
import { WebxdcSyncProvider } from 'webxdc-yjs-provider';

// Currently there is no UI to toggle this.
const manualSend = localStorage.getItem('manualSend') !== 'false';

const ydoc = new Y.Doc()
/** @type {ReturnType<typeof createEditor>} */
let prosemirror
const type = ydoc.getXmlFragment('prosemirror')

const provider = new WebxdcSyncProvider(ydoc);
if (manualSend) {
  // Updates are to be sent with the "sync" button.
  provider.onNeedToSendLocalUpdates = () => {};
}

addEventListener("DOMContentLoaded", () => {
  /** @type {HTMLDivElement} */
  const editor = document.querySelector('#editor')
  prosemirror = createEditor(editor);

  if (!manualSend) {
    // TODO improvement: detach the listener when there are no pending changes?
    // Or is that unnecessary for this event? I heard stuff about
    // back/forward cache.
    // TODO fix: this does not get executed in the current version of
    // Delta Chat Desktop.
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        provider.sendUnsentLocalUpdates();
      }
    });
  }
  // TODO maybe add `else` with `beforeunload` listener that prevents the close
  // if there are unsaved changes.

  initExtraButtons();
})

/**
 * @param {HTMLElement} element
 */
function createEditor(element) {
  return new EditorView(editor, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(type),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ].concat(exampleSetup({ schema })),
    }),
  });
}

function initExtraButtons() {
  const extraButtonsWrapper = /** @type {HTMLSpanElement} */
    (document.getElementById('extra-buttons'));
  const menuBar = document.getElementsByClassName('ProseMirror-menubar')[0];
  menuBar.appendChild(extraButtonsWrapper);
  extraButtonsWrapper.style.display = '';

  const themeButton = /** @type {HTMLButtonElement} */
    (document.getElementById('theme'));
  themeButton.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  })

  const syncButton = /** @type {HTMLButtonElement} */
    (document.getElementById('sync'));
  syncButton.addEventListener('click', () => {
    provider.sendUnsentLocalUpdates();
  });
  // TODO remove the button when there are no unsaved changes?
}
