# yjs_editor
This tool uses yjs (A CRDT tool), Deltachat and Vuejs to provide a WYSIWYG editor which can be used right out of deltachat.

<img width=200 src=https://user-images.githubusercontent.com/9800740/170771692-4f7c5d88-b5da-498d-9767-889de139d997.png>


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
