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
