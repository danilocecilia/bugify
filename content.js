function activateSelection() {
  const overlay = document.createElement('div')
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

  overlay.addEventListener('mousedown', (e) => {
    startX = e.clientX
    startY = e.clientY

    selectionBox = document.createElement('div')
    selectionBox.style.position = 'absolute'
    selectionBox.style.border = '2px dashed #fff'
    selectionBox.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
    selectionBox.style.left = `${startX}px`
    selectionBox.style.top = `${startY}px`
    overlay.appendChild(selectionBox)

    overlay.addEventListener('mousemove', resizeSelectionBox)
  })

  function resizeSelectionBox(e) {
    endX = e.clientX
    endY = e.clientY
    selectionBox.style.width = `${Math.abs(endX - startX)}px`
    selectionBox.style.height = `${Math.abs(endY - startY)}px`
    selectionBox.style.left = `${Math.min(startX, endX)}px`
    selectionBox.style.top = `${Math.min(startY, endY)}px`
  }

  overlay.addEventListener('mouseup', () => {
    overlay.removeEventListener('mousemove', resizeSelectionBox)
    overlay.remove()

    const captureArea = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
    }
    captureSelectedArea(captureArea)
  })
}

function captureSelectedArea(area) {
  chrome.runtime.sendMessage({ action: 'captureSelectedArea', area })
}

activateSelection()
