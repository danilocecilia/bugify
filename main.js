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
  const generateJiraButton = document.getElementById('generate-jira')
  const copyImageBtn = document.getElementById('copyImageBtn')
  const colorPicker = document.getElementById('color-picker')

  // Modal elements
  const jiraModal = document.getElementById('jiraModal')
  const modalJiraMarkup = document.getElementById('modal-jira-markup')
  const closeModal = document.getElementsByClassName('close')[0]
  const copyMarkupBtn = document.getElementById('copyMarkupBtn')

  // Apply max-width to drawingCanvas
  drawingCanvas.style.maxWidth = '100vw'

  // Load the captured image from chrome.storage.local
  chrome.storage.local.get('capturedImage', (result) => {
    if (result.capturedImage) {
      loadImage(result.capturedImage)
    } else {
      console.error('No captured image found')
    }
  })

  if (imageUrl) {
    loadImage(imageUrl)
  } else {
    console.error('No image URL found in query parameters')
  }

  activateDrawingButton.addEventListener('click', activateDrawing)
  activateArrowButton.addEventListener('click', activateArrow)
  activateTextButton.addEventListener('click', activateText)
  undoButton.addEventListener('click', restoreCanvasState)
  copyImageBtn.addEventListener('click', copyImageToClipboard)

  generateJiraButton.addEventListener('click', async () => {
    const data = {
      incident_ref: 'N/A',
      sales_name: 'sales_name_placeholder',
      lan_id: 'XXXXXXXX',
      dealer_code: 'XXXXX',
      device_type: '',
      device_os: '',
      os_version: '',
      screenshot_info: 'About Screenshot',
      version_number: 'X.X.XX-XX',
      commit_hash: '',
      issue_details: 'describe the issue here',
    }

    const markup = generateJiraMarkup(data, 'imageUrlPlaceHolder')
    modalJiraMarkup.textContent = markup
    jiraModal.style.display = 'block'
  })

  closeModal.addEventListener('click', () => {
    jiraModal.style.display = 'none'
  })

  window.addEventListener('click', (event) => {
    if (event.target == jiraModal) {
      jiraModal.style.display = 'none'
    }
  })

  copyMarkupBtn.addEventListener('click', () => {
    navigator.clipboard
      .writeText(modalJiraMarkup.textContent)
      .then(() => {
        alert('Markup copied to clipboard!')
      })
      .catch((error) => {
        console.error('Failed to copy markup: ', error)
        alert(
          'Failed to copy markup. Try a different method or check clipboard permissions.'
        )
      })
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      deactivateDrawing()
      deactivateArrow()
      deactivateText()
      jiraModal.style.display = 'none'
    }
  })
})
