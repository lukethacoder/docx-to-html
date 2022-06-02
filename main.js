import { convertToHtml } from 'mammoth/mammoth.browser'
import { Notyf } from 'notyf'

import 'notyf/notyf.min.css'
import './style.css'

// Create an instance of Notyf
const notyf = new Notyf({
  duration: 5000,
})

let editState = false

document
  .querySelector('#file-upload')
  .addEventListener('change', handleFileSelect, false)

document
  .querySelector('#btn-edit')
  .addEventListener('click', handleToggleEdit, false)

document
  .querySelector('#btn-copy')
  .addEventListener('click', handleCopyOutput, false)

function handleToggleEdit() {
  editState = !editState

  document.querySelector(`#edit-mode-state`).innerText = editState
    ? 'On'
    : 'Off'

  document.querySelector(`#output`).setAttribute('contenteditable', editState)
}

function handleCopyOutput() {
  copyToClip(document.querySelector('#output').innerHTML)
}

function copyToClip(str) {
  function listener(e) {
    e.clipboardData.setData('text/html', str)
    e.clipboardData.setData('text/plain', str)
    e.preventDefault()
  }
  document.addEventListener('copy', listener)
  document.execCommand('copy')
  document.removeEventListener('copy', listener)
  notyf.success('Copied output to clipboard')
}

async function handleFileSelect(e) {
  const files = e.target.files
  const theFile = files[0]

  // double check the file upload type
  if (!theFile.name.includes('docx')) {
    notyf.error('Invalid file type. Please upload a valid .docx file')
    displayResult(`<p></p>`)
    return
  }

  const outputContainer = document.querySelector('.output-container')

  readFileInputEventAsArrayBuffer(e, async function (arrayBuffer) {
    try {
      const output = await convertToHtml({ arrayBuffer: arrayBuffer })
      displayResult(output.value)
      outputContainer.dataset.hasOutput = true
    } catch (error) {
      console.error('error ', error)
      displayResult('')
      outputContainer.dataset.hasOutput = false
    }
  })
}

function displayResult(result) {
  document.querySelector('#output').innerHTML = result
}

function readFileInputEventAsArrayBuffer(event, callback) {
  const file = event.target.files[0]

  const reader = new FileReader()

  reader.onload = function (loadEvent) {
    var arrayBuffer = loadEvent.target.result
    callback(arrayBuffer)
  }

  reader.readAsArrayBuffer(file)
}
