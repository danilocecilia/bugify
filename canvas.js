let drawing = false
let drawingArrow = false
let addingText = false
let startX, startY
const canvasStates = []

function loadImage(imageSrc) {
  const capturedImage = document.getElementById('captured-image')
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')

  const tempImage = new Image()
  tempImage.src = imageSrc

  tempImage.onload = () => {
    capturedImage.width = tempImage.naturalWidth
    capturedImage.height = tempImage.naturalHeight
    drawingCanvas.width = tempImage.naturalWidth
    drawingCanvas.height = tempImage.naturalHeight
    ctx.drawImage(tempImage, 0, 0)
  }
}

function saveCanvasState() {
  const drawingCanvas = document.getElementById('drawing-canvas')
  canvasStates.push(drawingCanvas.toDataURL())
}

function restoreCanvasState() {
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')

  if (canvasStates.length > 0) {
    const previousState = canvasStates.pop()
    const img = new Image()
    img.src = previousState
    img.onload = () => {
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
      ctx.drawImage(img, 0, 0)
    }
  }
}

function startDrawing(e) {
  saveCanvasState()
  drawing = true
  draw(e)
}

function endDrawing() {
  drawing = false
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  ctx.beginPath()
}

function draw(e) {
  if (!drawing) return

  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  const colorPicker = document.getElementById('color-picker')

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

function startArrow(e) {
  saveCanvasState()
  drawingArrow = true
  const drawingCanvas = document.getElementById('drawing-canvas')
  startX = e.clientX - drawingCanvas.getBoundingClientRect().left
  startY = e.clientY - drawingCanvas.getBoundingClientRect().top
}

function endArrow(e) {
  if (!drawingArrow) return
  drawingArrow = false

  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  const colorPicker = document.getElementById('color-picker')

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
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  ctx.beginPath() // Reset the path
  drawingCanvas.addEventListener('mousedown', startDrawing)
  drawingCanvas.addEventListener('mouseup', endDrawing)
  drawingCanvas.addEventListener('mousemove', draw)
}

function deactivateDrawing() {
  const drawingCanvas = document.getElementById('drawing-canvas')
  drawingCanvas.removeEventListener('mousedown', startDrawing)
  drawingCanvas.removeEventListener('mouseup', endDrawing)
  drawingCanvas.removeEventListener('mousemove', draw)
}

function activateArrow() {
  deactivateDrawing()
  deactivateText()
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  ctx.beginPath() // Reset the path
  drawingCanvas.addEventListener('mousedown', startArrow)
  drawingCanvas.addEventListener('mouseup', endArrow)
}

function deactivateArrow() {
  const drawingCanvas = document.getElementById('drawing-canvas')
  drawingCanvas.removeEventListener('mousedown', startArrow)
  drawingCanvas.removeEventListener('mouseup', endArrow)
}

function activateText() {
  deactivateDrawing()
  deactivateArrow()
  addingText = true
  const drawingCanvas = document.getElementById('drawing-canvas')
  drawingCanvas.addEventListener('click', addTextPlaceholder)
}

function deactivateText() {
  addingText = false
  const drawingCanvas = document.getElementById('drawing-canvas')
  drawingCanvas.removeEventListener('click', addTextPlaceholder)
}

function addTextPlaceholder(e) {
  if (!addingText) return

  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  const colorPicker = document.getElementById('color-picker')

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
  const drawingCanvas = document.getElementById('drawing-canvas')
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
