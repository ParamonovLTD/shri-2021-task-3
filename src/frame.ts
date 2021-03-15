import { messageAction, XMessage } from './messages'
import { setElementTheme } from './application/view'
import './frame.css'

interface ExtendedWindow extends Window {
  renderTemplate: (alias: string, data: object) => string
}

declare var window: ExtendedWindow

function ready() {
  window.postMessage('load', '*')
}

function sendMessage(msg: XMessage) {
  window.postMessage(msg, '*')
}

function receiveMessage({ data }: MessageEvent<XMessage>) {
  if (data.type === 'message@UPDATE') {
    document.body.innerHTML = window.renderTemplate(data.alias, data.data)
  } else if (data.type === 'message@SET_THEME') {
    setElementTheme(document.body, data.theme)
  } // Добавить ACTION
}

function onDocumentClick(e: MouseEvent) {
  if (e.target instanceof HTMLElement) {
    let target: HTMLElement | null = e.target // Указал типы таргета, т.к. компилятор ругался
    while (target && !target.dataset.action) {
      target = target.parentElement
    }

    if (target) {
      // Сказал, что target !== null
      const { action, params } = target.dataset as {
        action: string
        params: string
      } // Указал типы, чтоб комп. не ругался
      sendMessage(messageAction(action, params))
    }
  }
}

document.addEventListener('DOMContentLoaded', ready)
document.body.addEventListener('click', onDocumentClick)
window.addEventListener('message', receiveMessage)
