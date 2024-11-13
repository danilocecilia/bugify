document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const imageUrl = urlParams.get('image')
  const capturedImage = document.getElementById('captured-image')
  const drawingCanvas = document.getElementById('drawing-canvas')
  const ctx = drawingCanvas.getContext('2d')
  const activateDrawingButton = document.getElementById('activate-drawing')
  const activateArrowButton = document.getElementById('activate-arrow')
  const activateTextButton = document.getElementById('activate-text')
  const undoButton = document.getElementById('undo')
  const colorPicker = document.getElementById('color-picker')

  // Load the captured image from chrome.storage.local
  chrome.storage.local.get('capturedImage', (result) => {
    if (result.capturedImage) {
      capturedImage.src = result.capturedImage

      // Create a temporary Image object to load and get the exact dimensions
      const tempImage = new Image()
      tempImage.src = result.capturedImage

      tempImage.onload = () => {
        // Set the capturedImage and canvas size to the natural dimensions
        capturedImage.width = tempImage.naturalWidth
        capturedImage.height = tempImage.naturalHeight
        drawingCanvas.width = tempImage.naturalWidth
        drawingCanvas.height = tempImage.naturalHeight

        // Draw the image on the canvas at its actual size
        ctx.drawImage(tempImage, 0, 0)
      }
    } else {
      console.error('No captured image found')
    }
  })

  if (imageUrl) {
    capturedImage.src = imageUrl
    capturedImage.onload = () => {
      // Set the capturedImage and canvas size to the natural dimensions
      capturedImage.width = capturedImage.naturalWidth
      capturedImage.height = capturedImage.naturalHeight
      drawingCanvas.width = capturedImage.naturalWidth
      drawingCanvas.height = capturedImage.naturalHeight

      // Draw the image on the canvas at its actual size
      ctx.drawImage(capturedImage, 0, 0)
    }
  } else {
    console.error('No image URL found in query parameters')
  }

  let drawing = false
  let drawingArrow = false
  let addingText = false
  let startX, startY
  const canvasStates = []

  function saveCanvasState() {
    canvasStates.push(drawingCanvas.toDataURL())
  }

  function restoreCanvasState() {
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
    ctx.beginPath()
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

  activateDrawingButton.addEventListener('click', activateDrawing)
  activateArrowButton.addEventListener('click', activateArrow)
  activateTextButton.addEventListener('click', activateText)
  undoButton.addEventListener('click', restoreCanvasState)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      deactivateDrawing()
      deactivateArrow()
      deactivateText()
    }
  })
})
