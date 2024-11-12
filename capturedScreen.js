// document.addEventListener('DOMContentLoaded', () => {
//   chrome.storage.local.get('capturedImage', (result) => {
//     if (result.capturedImage) {
//       document.getElementById('captured-image').src = result.capturedImage
//     } else {
//       console.error('No image data found in storage')
//     }
//   })
// })

document.addEventListener('DOMContentLoaded', () => {
  const imgElement = document.getElementById('captured-image')

  chrome.storage.local.get('capturedImage', (result) => {
    if (result.capturedImage) {
      imgElement.src = result.capturedImage

      // Create a temporary Image object to load and get the exact dimensions
      const tempImage = new Image()
      tempImage.src = result.capturedImage

      tempImage.onload = () => {
        imgElement.style.width = `${tempImage.naturalWidth}px`
        imgElement.style.height = `${tempImage.naturalHeight}px`
      }
    } else {
      console.error('No captured image found')
    }
  })
})
