chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSelection') {
    activateSelection()
  }
})

function activateSelection() {
  let existingOverlay = document.getElementById('selection-overlay')
  if (existingOverlay) existingOverlay.remove()

  const overlay = document.createElement('div')
  overlay.id = 'selection-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.cursor = 'crosshair'
  overlay.style.zIndex = '9999'
  document.body.appendChild(overlay)

  let startX, startY, endX, endY
  let selectionBox = null

  function startSelection(e) {
    startX = e.clientX
    startY = e.clientY

    if (selectionBox) selectionBox.remove()

    selectionBox = document.createElement('div')
    selectionBox.style.position = 'absolute'
    selectionBox.style.border = '2px dashed #fff'
    selectionBox.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
    selectionBox.style.left = `${startX}px`
    selectionBox.style.top = `${startY}px`
    overlay.appendChild(selectionBox)

    document.addEventListener('mousemove', resizeSelectionBox)
    document.addEventListener('mouseup', endSelection)
  }

  function resizeSelectionBox(e) {
    endX = e.clientX
    endY = e.clientY
    selectionBox.style.width = `${Math.abs(endX - startX)}px`
    selectionBox.style.height = `${Math.abs(endY - startY)}px`
    selectionBox.style.left = `${Math.min(startX, endX)}px`
    selectionBox.style.top = `${Math.min(startY, endY)}px`
  }

  function endSelection() {
    document.removeEventListener('mousemove', resizeSelectionBox)
    document.removeEventListener('mouseup', endSelection)

    const pixelRatio = window.devicePixelRatio || 1

    const captureArea = {
      left: Math.min(startX, endX) * pixelRatio,
      top: Math.min(startY, endY) * pixelRatio,
      width: Math.abs(endX - startX) * pixelRatio,
      height: Math.abs(endY - startY) * pixelRatio,
    }

    // Temporarily remove the overlay and selection box before capturing the screenshot
    document.body.removeChild(overlay)
    if (selectionBox) selectionBox.remove()

    // Capture the selected area
    try {
      setTimeout(() => {
        captureSelectedArea(captureArea, () => {
          // Ensure the overlay and selection box are removed after capturing the screenshot
          if (overlay) overlay.remove()
          if (selectionBox) selectionBox.remove()
        })
      }, 100) // Delay to ensure the overlay and selection box are removed
    } catch (error) {
      console.error('Error capturing area:', error)
    }
  }

  overlay.addEventListener('mousedown', startSelection)
}

function captureSelectedArea(area, callback) {
  try {
    chrome.runtime.sendMessage(
      { action: 'captureSelectedArea', area },
      callback
    )
  } catch (error) {
    console.error('Error sending message to background script:', error)
  }
}
