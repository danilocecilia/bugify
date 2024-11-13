document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed')
  const captureButton = document.getElementById('capture-screenshot')
  const recordButton = document.getElementById('record-video')
  const captureAreaButton = document.getElementById('capture-area-screenshot')
  let lastCaptureTime = 0
  const CAPTURE_INTERVAL = 1000 // 1 second

  if (captureButton) {
    console.log('Capture button found')
    captureButton.addEventListener('click', () => {
      console.log('Capture button clicked')
      const now = Date.now()
      if (now - lastCaptureTime < CAPTURE_INTERVAL) {
        console.warn('Capture request ignored to avoid exceeding quota')
        return
      }
      lastCaptureTime = now

      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message)
          return
        }
        console.log('Screenshot captured', dataUrl)
        chrome.storage.local.set({ capturedImage: dataUrl }, () => {
          const capturedScreenUrl = chrome.runtime.getURL('capturedScreen.html')
          chrome.tabs.create({ url: capturedScreenUrl })
          window.close()
        })
      })
    })
  } else {
    console.error('Capture button not found')
  }

  if (captureAreaButton) {
    console.log('Capture area button found')
    captureAreaButton.addEventListener('click', () => {
      console.log('Capture area button clicked')
      chrome.runtime.sendMessage({ action: 'initCapture' }, window.close())
    })
  } else {
    console.error('Capture area button not found')
  }

  if (recordButton) {
    console.log('Record button found')
    recordButton.addEventListener('click', () => {
      console.log('Record button clicked')
      // Placeholder for video recording logic
      console.log('Start video recording...')
      window.close()
    })
  } else {
    console.error('Record button not found')
  }
})
