document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('capturedImage', (result) => {
    if (result.capturedImage) {
      document.getElementById('captured-image').src = result.capturedImage
    } else {
      console.error('No image data found in storage')
    }
  })
})
