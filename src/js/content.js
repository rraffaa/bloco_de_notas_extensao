function showMessage(message) {
    
    let messageDiv = document.getElementById('feedback-message');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'feedback-message';
      messageDiv.style.marginTop = '10px';
      messageDiv.style.color = 'green';
      messageDiv.style.fontSize = '14px';
      messageDiv.style.fontStyle = 'italic';
      document.getElementById('note').insertAdjacentElement('afterend', messageDiv);
    }
  
    messageDiv.textContent = message;
  
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
      messageDiv.textContent = '';
    }, 5000);
  }
  
  function saveNote() {
    // Lógica para salvar a nota...
    showMessage('Nota salva com sucesso!');
  }
  