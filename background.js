chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'initCapture' })
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'initCapture') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('🚀 ~ chrome.tabs.query ~ tabs:', tabs)
      console.log('🚀 ~ chrome.tabs.query ~ sender:', sender)
      if (tabs[0].url?.startsWith('chrome://')) return undefined

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js'],
      })
    })
  } else if (request.action === 'captureSelectedArea') {
    const { left, top, width, height } = request.area
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        return
      }
      createCroppedImage(
        dataUrl,
        left,
        top,
        width,
        height,
        (croppedDataUrl) => {
          chrome.storage.local.set({ capturedImage: croppedDataUrl }, () => {
            const capturedScreenUrl = chrome.runtime.getURL(
              'capturedScreen.html'
            )
            chrome.tabs.create({ url: capturedScreenUrl })
          })
        }
      )
    })
  }
})

function createCroppedImage(dataUrl, left, top, width, height, callback) {
  const img = new OffscreenCanvas(1, 1)
  const context = img.getContext('2d')
  fetch(dataUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const imageBitmap = createImageBitmap(blob)
      return imageBitmap
    })
    .then((imageBitmap) => {
      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imageBitmap, left, top, width, height, 0, 0, width, height)
      canvas.convertToBlob().then((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          callback(reader.result)
        }
        reader.readAsDataURL(blob)
      })
    })
    .catch((error) => {
      console.error('Error creating cropped image:', error)
    })
}
