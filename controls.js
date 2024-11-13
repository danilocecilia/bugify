let drawing = false
let drawingArrow = false
let addingText = false
let startX, startY
const canvasStates = []

function saveCanvasState() {
  canvasStates.push(drawingCanvas.toDataURL())
}

function draw(e) {
  if (!drawing) return

  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.strokeStyle = colorPicker.value

  const rect = drawingCanvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function startDrawing(e) {
  saveCanvasState()
  drawing = true
  draw(e)
}

function endDrawing() {
  drawing = false
  ctx.beginPath()
}

function startArrow(e) {
  saveCanvasState()
  drawingArrow = true
  startX = e.clientX - drawingCanvas.getBoundingClientRect().left
  startY = e.clientY - drawingCanvas.getBoundingClientRect().top
}

function endArrow(e) {
  if (!drawingArrow) return
  drawingArrow = false

  const endX = e.clientX - drawingCanvas.getBoundingClientRect().left
  const endY = e.clientY - drawingCanvas.getBoundingClientRect().top

  ctx.strokeStyle = colorPicker.value
  ctx.lineWidth = 5

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Draw arrowhead
  const headLength = 10
  const angle = Math.atan2(endY - startY, endX - startX)
  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(endX, endY)
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}

function activateDrawing() {
  deactivateArrow()
  deactivateText()
  ctx.beginPath() // Reset the path
  drawingCanvas.addEventListener('mousedown', startDrawing)
  drawingCanvas.addEventListener('mouseup', endDrawing)
  drawingCanvas.addEventListener('mousemove', draw)
}

function deactivateDrawing() {
  drawingCanvas.removeEventListener('mousedown', startDrawing)
  drawingCanvas.removeEventListener('mouseup', endDrawing)
  drawingCanvas.removeEventListener('mousemove', draw)
}

function activateArrow() {
  deactivateDrawing()
  deactivateText()
  ctx.beginPath() // Reset the path
  drawingCanvas.addEventListener('mousedown', startArrow)
  drawingCanvas.addEventListener('mouseup', endArrow)
}

function deactivateArrow() {
  drawingCanvas.removeEventListener('mousedown', startArrow)
  drawingCanvas.removeEventListener('mouseup', endArrow)
}

function activateText() {
  deactivateDrawing()
  deactivateArrow()
  addingText = true
  drawingCanvas.addEventListener('click', addTextPlaceholder)
}

function deactivateText() {
  addingText = false
  drawingCanvas.removeEventListener('click', addTextPlaceholder)
}

function addTextPlaceholder(e) {
  if (!addingText) return

  const rect = drawingCanvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const input = document.createElement('input')
  input.type = 'text'
  input.style.position = 'absolute'
  input.style.left = `${e.clientX}px`
  input.style.top = `${e.clientY}px`
  input.style.border = '1px solid black'
  input.style.background = 'white'
  input.style.zIndex = 1000

  const okButton = document.createElement('button')
  okButton.innerText = 'OK'
  okButton.style.position = 'absolute'
  okButton.style.left = `${e.clientX + input.offsetWidth + 5}px`
  okButton.style.top = `${e.clientY}px`
  okButton.style.zIndex = 1000

  document.body.appendChild(input)
  document.body.appendChild(okButton)

  input.focus()

  function placeText() {
    saveCanvasState()
    const text = input.value
    ctx.fillStyle = colorPicker.value
    ctx.font = '20px Arial'
    ctx.fillText(text, x, y + 20)

    document.body.removeChild(input)
    document.body.removeChild(okButton)
  }

  function cancelText() {
    document.body.removeChild(input)
    document.body.removeChild(okButton)
  }

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      placeText()
    } else if (event.key === 'Escape') {
      cancelText()
    }
  })

  okButton.addEventListener('click', placeText)
}

async function copyImageToClipboard() {
  drawingCanvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      alert(
        'Image copied to clipboard! You can now paste it directly into JIRA.'
      )
    } catch (error) {
      console.error('Failed to copy image: ', error)
      alert(
        'Failed to copy image. Try a different method or check clipboard permissions.'
      )
    }
  })
}

function generateJiraMarkup(data, imageUrl) {
  const deviceInfo = getDeviceInfo()

  return `{panel:title=Incident Reference|titleBGColor=lightsalmon}
          ServiceNow Incident Reference: ${data.incident_ref}
          {panel}

          {panel:title=Incident Details|titleBGColor=pink}
          *Dealership Information:*
          Sales Consultant Name: ${data.sales_name}
          Sales Consultant Lan ID: ${data.lan_id}
          Dealership Code: ${data.dealer_code}

          *Device Information:*
          Device Type: ${deviceInfo.deviceType}
          Device OS: ${deviceInfo.os}
          Device OS Version: ${deviceInfo.osVersion}
          About Screenshot: ${data.screenshot_info}

          *Application Information:*
          Version Number: ${data.version_number}
          Version Commit Hash: ${data.commit_hash}
          {panel}

          {panel:title=Issue|titleBGColor=darksalmon}
          ${data.issue_details}
          {panel}

          {panel:title=Add Screenshot(s) or video of issue|titleBGColor=lightgrey}
          ![Screenshot](${imageUrl})
          {panel}`
}
