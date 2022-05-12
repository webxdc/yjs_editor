import { Schema } from 'prosemirror-model'

const brDOM = ['br']

const calcYchangeDomAttrs = (attrs: { ychange: { user: any; state: any } | null }, domAttrs = {}) => {
  domAttrs = Object.assign({}, domAttrs)
  if (attrs.ychange !== null) {
    domAttrs.ychange_user = attrs.ychange.user
    domAttrs.ychange_state = attrs.ychange.state
  }
  return domAttrs
}

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: 'block+',
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    attrs: { ychange: { default: null } },
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM(node) { return ['p', calcYchangeDomAttrs(node.attrs), 0] },
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    attrs: { ychange: { default: null } },
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM(node) { return ['blockquote', calcYchangeDomAttrs(node.attrs), 0] },
  },


  // :: NodeSpec The text node.
  text: {
    group: 'inline',
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() { return brDOM },
  },
}

const emDOM = ['em', 0]; const strongDOM = ['strong', 0]; const codeDOM = ['code', 0]

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM() { return emDOM },
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [{ tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
    toDOM() { return strongDOM },
  },

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() { return codeDOM },
  },
  ychange: {
    attrs: {
      user: { default: null },
      state: { default: null },
    },
    inclusive: false,
    parseDOM: [{ tag: 'ychange' }],
    toDOM(node) {
      return ['ychange', { ychange_user: node.attrs.user, ychange_state: node.attrs.state }, 0]
    },
  },
}

// :: Schema
// This schema rougly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
export const schema = new Schema({ nodes, marks })
