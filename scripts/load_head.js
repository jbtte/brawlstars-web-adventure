// scripts/load_head.js

document.addEventListener('DOMContentLoaded', function () {
  fetch('../includes/head_template.html') // Caminho relativo à raiz do site
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ao carregar /head_template.html`
        );
      }
      return response.text();
    })
    .then((data) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data; // Parseia o HTML do template

      // --- INJETAR CONTEÚDO NO HEAD ---
      Array.from(tempDiv.children).forEach((element) => {
        // Apenas elementos que são válidos para o <head>
        if (['META', 'TITLE', 'LINK'].includes(element.tagName)) {
          // Evita duplicação de links CSS que já podem estar no HTML original para CSS específico da página
          if (
            element.tagName === 'LINK' &&
            document.head.querySelector(
              `link[href="${element.getAttribute('href')}"]`
            )
          ) {
            return; // Pula se o link já existe
          }
          // Sobrescreve o título se não for o dinâmico da lição
          if (
            element.tagName === 'TITLE' &&
            document.head.querySelector('#lesson-title-tag')
          ) {
            return; // Mantém o título dinâmico da lição
          }
          document.head.appendChild(element);
        }
      });

      // Remove o script load_head.js após a execução para evitar duplicação em ambientes específicos
      const currentScript = document.querySelector(
        'script[src="scripts/load_head.js"]'
      );
      if (currentScript) {
        currentScript.remove();
      }
    })
    .catch((error) => console.error('Erro ao carregar o head:', error));
});
