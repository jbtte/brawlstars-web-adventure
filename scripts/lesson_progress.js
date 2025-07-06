// scripts/lesson_progress.js

document.addEventListener('DOMContentLoaded', () => {
  // Seleciona todos os cards de lição no mapa
  const lessonCards = document.querySelectorAll(
    '.lesson-map-container .lesson-card'
  );

  if (typeof Storage !== 'undefined') {
    lessonCards.forEach((card) => {
      // Assumimos que cada card tem um link interno com um href para a lição
      // Ex: <a href="day.html?id=day1"> ou <a href="day1.html">
      const lessonLink = card.querySelector('a');
      if (lessonLink) {
        let lessonId;
        const href = lessonLink.getAttribute('href');

        // Tenta extrair o ID da lição da URL
        // Ex: "day.html?id=day1" -> "day1"
        // Ex: "day1.html" -> "day1"
        const urlMatch = href.match(/(day(\d+))(\.html)?(\?id=)?(day(\d+))?/i);
        if (urlMatch && urlMatch[2]) {
          // Captura o número do dia do primeiro grupo (day1)
          lessonId = `day${urlMatch[2]}`;
        } else if (urlMatch && urlMatch[6]) {
          // Captura o número do dia do segundo grupo (id=day1)
          lessonId = `day${urlMatch[6]}`;
        } else {
          console.warn(`Não foi possível extrair lessonId de: ${href}`);
          return; // Pula para o próximo card se o ID não for encontrado
        }

        // Verifica se a lição foi marcada como visitada no localStorage
        if (localStorage.getItem(`lesson_${lessonId}`) === 'visited') {
          card.classList.add('visited'); // Adiciona a classe CSS
          console.log(`Card para lição ${lessonId} marcado como visitado.`);
        }
      }
    });
  } else {
    console.warn(
      'Seu navegador não suporta localStorage. O progresso não será exibido.'
    );
  }
});
