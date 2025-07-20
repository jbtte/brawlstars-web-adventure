// scripts/lesson_progress.js

// Função principal para atualizar o status visual dos cards de lição no mapa
// Esta função será acessível globalmente (via window) para ser chamada de 'load_lesson_content.js'
window.updateLessonStatusOnMap = function () {
  const lessonCards = document.querySelectorAll(
    '.lesson-map-container .lesson-card'
  );

  if (typeof Storage === 'undefined') {
    console.warn(
      'Seu navegador não suporta localStorage. O progresso não será exibido/salvo.'
    );
    return;
  }

  lessonCards.forEach((card) => {
    const lessonLink = card.querySelector('a');
    if (lessonLink) {
      let lessonId;
      const href = lessonLink.getAttribute('href');

      // Extrai o ID da lição da URL (day.html?id=dayX ou dayX.html)
      // Ajustado para ser mais robusto com a nova estrutura de links
      const urlMatch = href.match(/id=(day\d+)|(day\d+)\.html/i);
      if (urlMatch) {
        lessonId = urlMatch[1] || urlMatch[2]; // Pega o primeiro grupo capturado que não seja nulo
      } else {
        console.warn(`Não foi possível extrair lessonId de: ${href}`);
        return;
      }

      // Verifica se a lição foi marcada como visitada no localStorage
      if (localStorage.getItem(`lesson_${lessonId}`) === 'visited') {
        card.classList.add('visited'); // Adiciona a classe CSS
        // Também pode remover a classe 'locked' se você usar uma para lições ainda não iniciadas
        // const statusIcon = card.querySelector('.status-icon');
        // if (statusIcon) {
        //   statusIcon.classList.remove('locked');
        //   statusIcon.classList.add('unlocked'); // Ou 'completed' para lições visitadas
        // }
      } else {
        card.classList.remove('visited'); // Garante que a classe seja removida se o progresso for zerado ou não visitado
        // const statusIcon = card.querySelector('.status-icon');
        // if (statusIcon) {
        //   statusIcon.classList.add('locked'); // Ou 'unlocked' para lições não visitadas mas acessíveis
        // }
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // Chamada inicial para atualizar o status dos cards ao carregar o index.html
  // ou quando for navegada para o index.html
  window.updateLessonStatusOnMap();

  // Seleciona o botão de zerar progresso
  const resetButton = document.getElementById('reset-lessons-button');

  // Função para zerar o progresso
  function resetAllLessons() {
    if (
      confirm(
        'Tem certeza que deseja zerar todo o seu progresso? Esta ação não pode ser desfeita!'
      )
    ) {
      if (typeof Storage !== 'undefined') {
        // Percorre todos os itens do localStorage e remove os relacionados a lições
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('lesson_')) {
            localStorage.removeItem(key);
          }
        }
        // Remove também o ID da lição atual, se houver
        localStorage.removeItem('currentLessonId');
        console.log('Progresso de todas as lições zerado.');
        window.updateLessonStatusOnMap(); // Atualiza o status visual dos cards após zerar
      }
    }
  }

  // Adiciona o event listener ao botão de zerar progresso
  if (resetButton) {
    resetButton.addEventListener('click', resetAllLessons);
  }
});
