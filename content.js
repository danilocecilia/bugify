chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSelection') {
    activateSelection()
  }
})

function activateSelection() {
  // Remove any existing overlay to prevent darkening on repeated captures
  let existingOverlay = document.getElementById('selection-overlay')
  if (existingOverlay) existingOverlay.remove()

  const overlay = document.createElement('div')
  overlay.id = 'selection-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.cursor = 'crosshair'
  overlay.style.zIndex = '9999'
  document.body.appendChild(overlay)

  let startX, startY, endX, endY
  let selectionBox = null

  function startSelection(e) {
    startX = e.clientX
    startY = e.clientY

    // Remove the existing selection box if there is one
    if (selectionBox) selectionBox.remove()

    selectionBox = document.createElement('div')
    selectionBox.style.position = 'absolute'
    selectionBox.style.border = '2px dashed #fff'
    // selectionBox.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
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
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    const captureArea = {
      left: (Math.min(startX, endX) + scrollX) * pixelRatio,
      top: (Math.min(startY, endY) + scrollY) * pixelRatio,
      width: Math.abs(endX - startX) * pixelRatio,
      height: Math.abs(endY - startY) * pixelRatio,
    }

    // Remove the overlay completely before capturing the screenshot
    overlay.remove()

    // Try to capture the selected area and handle any extension context issues
    try {
      captureSelectedArea(captureArea, () => {
        // Optionally, you can re-add the overlay or perform other actions here if needed
      })
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
