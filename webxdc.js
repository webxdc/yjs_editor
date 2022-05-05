/* eslint-disable no-console */
// debug friend: document.writeln(JSON.stringify(value));
// @ts-check
/** @type {import('./webxdc').Webxdc<any>} */
window.webxdc = (() => {
  let updateListener = (_) => {}
  const updatesKey = '__xdcUpdatesKey__'
  window.addEventListener('storage', (event) => {
    if (event.key == null) {
      window.location.reload()
    }
    else if (event.key === updatesKey) {
      const updates = JSON.parse(event.newValue)
      const update = updates[updates.length - 1]
      update.max_serial = updates.length
      console.log(`[Webxdc] ${JSON.stringify(update)}`)
      updateListener(update)
    }
  })

  function getUpdates() {
    const updatesJSON = window.localStorage.getItem(updatesKey)
    return updatesJSON ? JSON.parse(updatesJSON) : []
  }

  const params = new URLSearchParams(window.location.hash.substr(1))
  return {
    selfAddr: params.get('addr') || 'device0@local.host',
    selfName: params.get('name') || 'device0',
    setUpdateListener: (cb, serial = 0) => {
      const updates = getUpdates()
      const maxSerial = updates.length
      updates.forEach((update) => {
        if (update.serial > serial) {
          update.max_serial = maxSerial
          cb(update)
        }
      })
      updateListener = cb
    },
    getAllUpdates: () => {
      console.log('[Webxdc] WARNING: getAllUpdates() is deprecated.')
      return Promise.resolve([])
    },
    sendUpdate: (update, description) => {
      const updates = getUpdates()
      const serial = updates.length + 1
      const _update = { payload: update.payload, summary: update.summary, info: update.info, serial }
      updates.push(_update)
      window.localStorage.setItem(updatesKey, JSON.stringify(updates))
      _update.max_serial = serial
      console.log(`[Webxdc] description="${description}", ${JSON.stringify(_update)}`)
      updateListener(_update)
    },
  }
})()

window.addXdcPeer = () => {
  const loc = window.location
  // get next peer ID
  const params = new URLSearchParams(loc.hash.substr(1))
  const peerId = Number(params.get('next_peer')) || 1

  // open a new window
  const peerName = `device${peerId}`
  const url = `${loc.protocol}//${loc.host}${loc.pathname}#name=${peerName}&addr=${peerName}@local.host`
  window.open(url)

  // update next peer ID
  params.set('next_peer', String(peerId + 1))
  window.location.hash = `#${params.toString()}`
}

window.clearXdcStorage = () => {
  window.localStorage.clear()
  window.location.reload()
}

window.alterXdcApp = () => {
  const styleControlPanel = 'position: fixed; bottom:1em; left:1em; background-color: #000; opacity:0.8; padding:.5em; font-family: sans-serif; color:#fff; z-index: 9999'
  const styleMenuLink = 'color:#fff; text-decoration: none; vertical-align: middle'
  const styleAppIcon = 'height: 1.5em; width: 1.5em; margin-right: 0.5em; border-radius:10%; vertical-align: middle'
  let title = document.getElementsByTagName('title')[0]
  if (typeof title == 'undefined') {
    title = document.createElement('title')
    document.getElementsByTagName('head')[0].append(title)
  }
  title.innerText = window.webxdc.selfAddr

  if (window.webxdc.selfName === 'device0') {
    const div = document.createElement('div')
    div.innerHTML
            = `<div style="${styleControlPanel}">`
            + `<a href="javascript:window.addXdcPeer();" style="${styleMenuLink}">Add Peer</a>`
            + `<span style="${styleMenuLink}"> | </span>`
            + `<a href="javascript:window.clearXdcStorage();" style="${styleMenuLink}">Clear Storage</a>`
            + '<div>'
    const controlPanel = div.firstChild

    function loadIcon(name) {
      const tester = new Image()
      tester.onload = () => {
        div.innerHTML = `<img src="${name}" style="${styleAppIcon}">`
        controlPanel.insertBefore(div.firstChild, controlPanel.firstChild)
      }
      tester.src = name
    }
    loadIcon('icon.png')
    loadIcon('icon.jpg')

    document.getElementsByTagName('body')[0].append(controlPanel)
  }
}

window.addEventListener('load', window.alterXdcApp)
