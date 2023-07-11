# this repo was moved to https://codeberg.org/webxdc/editor

## yjs_editor
This tool uses yjs (A CRDT tool) to provide a WYSIWYG editor which can be used as a  [chat-shared app](https://webxdc.org) as supported by [Delta Chat](https://delta.chat) or [Cheogram](https://cheogram.com). 

<img width=200 src=https://user-images.githubusercontent.com/9800740/170771692-4f7c5d88-b5da-498d-9767-889de139d997.png>


## Technical Details
- Prosemirror
- Yjs
- Deltachat

## Development

install dependecies 
```
npm install
```
run the dev-server (vite)
```
npm run dev
```

### Building
```
npm build
```
together with the script this should create a bundeled *.xdc app which can be send into deltachat chats.
