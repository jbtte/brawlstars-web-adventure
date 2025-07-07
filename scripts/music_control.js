// scripts/music_control.js

document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('background-music');
  const toggleButton = document.getElementById('music-toggle-button');

  if (!music || !toggleButton) {
    console.warn('Elemento de música ou botão de controle não encontrado.');
    return;
  }

  let isMusicPlaying = false; // Estado inicial da música

  // Tenta carregar o estado salvo do localStorage
  if (typeof Storage !== 'undefined') {
    const savedState = localStorage.getItem('musicPreference');
    if (savedState === 'playing') {
      // Tenta tocar, mas pode falhar sem interação do usuário
      // music.play().catch(e => console.log("Música não iniciada automaticamente, requer interação do usuário."));
      // isMusicPlaying = true; // Define o estado, mas o play real será via clique
      // toggleButton.textContent = '🎵 Ligado';
      // Remover autostart, apenas prepara o estado
    } else if (savedState === 'paused') {
      isMusicPlaying = false;
      toggleButton.textContent = '🔇 Desligado';
    }
  }

  toggleButton.addEventListener('click', () => {
    if (isMusicPlaying) {
      music.pause();
      toggleButton.textContent = '🔇 Desligado';
      isMusicPlaying = false;
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('musicPreference', 'paused');
      }
    } else {
      music
        .play()
        .then(() => {
          toggleButton.textContent = '🎵 Ligado';
          isMusicPlaying = true;
          if (typeof Storage !== 'undefined') {
            localStorage.setItem('musicPreference', 'playing');
          }
        })
        .catch((e) => {
          console.error('Erro ao tentar tocar a música:', e);
          // Informa o usuário que não foi possível tocar automaticamente
          toggleButton.textContent = '⚠️ Erro';
          alert(
            'O navegador impediu a reprodução automática da música. Por favor, clique novamente.'
          );
          isMusicPlaying = false; // Mantém o estado como não tocando
          if (typeof Storage !== 'undefined') {
            localStorage.setItem('musicPreference', 'paused');
          }
        });
    }
  });

  // Se o estado inicial é para tocar e o usuário já interagiu antes, tenta tocar
  // (Pode precisar de um clique inicial do usuário por restrições do navegador)
  if (localStorage.getItem('musicPreference') === 'playing') {
    // Apenas para mostrar o status correto no botão, o play real virá do clique
    isMusicPlaying = true;
    toggleButton.textContent = '🎵 Ligado';
  }
});
