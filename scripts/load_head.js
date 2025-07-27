// scripts/load_head.js

document.addEventListener('DOMContentLoaded', function () {
  // Função para determinar o caminho base do projeto
  // Funciona tanto para ambientes locais (ex: http://127.0.0.1:5500/)
  // quanto para GitHub Pages (ex: https://usuario.github.io/nome-do-repositorio/)
  const getProjectBasePath = () => {
    // Se a URL contém ".github.io" e não é um domínio raiz (ex: "user.github.io")
    // E se window.location.pathname não é apenas "/" (homepage)
    if (
      window.location.hostname.includes('.github.io') &&
      window.location.pathname !== '/'
    ) {
      const pathSegments = window.location.pathname.split('/');
      // O nome do repositório é geralmente o primeiro segmento após a barra inicial em GitHub Pages
      if (pathSegments.length > 1 && pathSegments[1] !== '') {
        // Retorna algo como "/nome-do-repositorio/"
        return `/${pathSegments[1]}/`;
      }
    }
    // Para ambientes locais ou domínios personalizados onde o site está na raiz
    return '/';
  };

  const projectBasePath = getProjectBasePath();

  // O caminho para head_template.html, relativo à raiz do PROJETO.
  // Baseado na sua estrutura de pastas, head_template.html está em /includes/
  const headTemplateRelativePath = `includes/head_template.html`;

  // Constrói a URL completa que DEVE funcionar em AMBOS os ambientes
  const fullHeadTemplateUrl = `${projectBasePath}${headTemplateRelativePath}`;

  fetch(fullHeadTemplateUrl)
    .then((response) => {
      if (!response.ok) {
        // Adiciona a URL COMPLETA que tentou carregar na mensagem de erro
        throw new Error(
          `HTTP error! Status: ${response.status} ao carregar: ${fullHeadTemplateUrl}`
        );
      }
      return response.text();
    })
    .then((data) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data;

      Array.from(tempDiv.children).forEach((element) => {
        if (['META', 'TITLE', 'LINK'].includes(element.tagName)) {
          // Evita duplicação de links CSS que já podem estar no HTML original
          if (
            element.tagName === 'LINK' &&
            document.head.querySelector(
              `link[href="${element.getAttribute('href')}"]`
            )
          ) {
            return;
          }
          // Sobrescreve o título se não for o dinâmico da lição
          if (
            element.tagName === 'TITLE' &&
            document.head.querySelector('#lesson-title-tag')
          ) {
            return;
          }
          document.head.appendChild(element);
        }
      });

      const currentScript = document.querySelector(
        'script[src="scripts/load_head.js"]'
      );
      if (currentScript) {
        currentScript.remove();
      }
    })
    .catch((error) => console.error('Erro ao carregar o head:', error));
});
