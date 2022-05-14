# yjs_editor
This tool uses yjs (A CRDT tool), Deltachat and Vuejs to provide a WYSIWYG editor which can be used right out of deltachat.

## Technical Details
- Vuejs
- Prosemirror
- Yjs
- Deltachat

This projected uses the great [vitesse](https://github.com/antfu/vitesse) template.

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
