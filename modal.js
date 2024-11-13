const jiraModal = document.getElementById('jiraModal')
const modalJiraMarkup = document.getElementById('modal-jira-markup')
const closeModal = document.getElementsByClassName('close')[0]
const copyMarkupBtn = document.getElementById('copyMarkupBtn')

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
