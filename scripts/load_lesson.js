// scripts/load_lesson.js

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('id'); // Obtém o 'id' da URL (ex: ?id=day1)

  if (!lessonId) {
    displayErrorMessage(
      'Lição Não Especificada',
      'Por favor, selecione uma lição na página principal para iniciar sua aventura.'
    );
    return;
  }

  try {
    // Tenta carregar o arquivo JSON da lição
    const response = await fetch(`/scripts/lessons_data/${lessonId}.json`);

    if (!response.ok) {
      // Se a resposta NÃO for OK (por exemplo, 404 Not Found)
      if (response.status === 404) {
        // Lição não encontrada = lição ainda em construção
        displayErrorMessage(
          'Lição em Construção!',
          `A Fase **${lessonId.replace(
            'day',
            'Dia '
          )}** ainda está sendo codificada. Volte em breve para continuar sua aventura!`
        );
      } else {
        // Outros erros HTTP (500, etc.)
        throw new Error(
          `Erro ao carregar lição: ${response.statusText} (${response.status})`
        );
      }
      return; // Sai da função após exibir a mensagem de erro/construção
    }

    const lesson = await response.json(); // Analisa os dados JSON

    // -----------------------------------------------------------------
    // Injeção de conteúdo (mantida igual, caso a lição seja encontrada)
    // -----------------------------------------------------------------

    // Atualiza o título da página e o cabeçalho
    document.getElementById('lesson-title-tag').textContent = lesson.title;
    document.getElementById('lesson-header-title').textContent = lesson.title;

    // Injeta os conceitos
    const conceptsContainer = document.getElementById(
      'lesson-concepts-container'
    );
    conceptsContainer.innerHTML = ''; // Limpa o conteúdo existente
    lesson.concepts.forEach((concept) => {
      const section = document.createElement('section');
      const heading = document.createElement('h2');
      heading.innerHTML = concept.heading;

      const text = document.createElement('p');
      text.innerHTML = concept.text;

      section.appendChild(heading);
      section.appendChild(text);

      if (concept.code) {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = 'language-python';
        code.textContent = concept.code;
        pre.appendChild(code);
        section.appendChild(pre);
      }
      conceptsContainer.appendChild(section);
    });

    // Injeta os exercícios
    const exercisesContainer = document.getElementById(
      'lesson-exercises-container'
    );
    // Remove a lista de exercícios anterior se existir, para evitar duplicação
    exercisesContainer.querySelector('.exercise-list-container')?.remove();

    const exercisesListDiv = document.createElement('div'); // Cria um contêiner para a lista de exercícios
    exercisesListDiv.className = 'exercise-list-container';

    // Se houver exercícios na lição
    if (lesson.exercises && lesson.exercises.length > 0) {
      lesson.exercises.forEach((exercise) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise';

        const prompt = document.createElement('p');
        prompt.innerHTML = exercise.prompt;

        exerciseDiv.appendChild(prompt);

        if (exercise.code_hint) {
          const pre = document.createElement('pre');
          const code = document.createElement('code');
          code.className = 'exercise-snippet';
          code.textContent = exercise.code_hint;
          pre.appendChild(code);
          exerciseDiv.appendChild(pre);
        }
        exercisesListDiv.appendChild(exerciseDiv);
      });
      exercisesContainer.appendChild(exercisesListDiv);
    } else {
      // Se não houver exercícios para esta lição
      exercisesListDiv.innerHTML = `<p>Nenhum exercício disponível para esta lição ainda. Continue a aventura na próxima fase!</p>`;
      exercisesContainer.appendChild(exercisesListDiv);
    }

    // Opcional: Atualiza o IDE com o código inicial ou a primeira dica de exercício
    const ideEditor = document.getElementById('python-code-editor');
    if (ideEditor) {
      if (lesson.exercises.length > 0 && lesson.exercises[0].code_hint) {
        ideEditor.value = lesson.exercises[0].code_hint;
      } else if (lesson.concepts.length > 0 && lesson.concepts[0].code) {
        ideEditor.value = lesson.concepts[0].code;
      } else {
        ideEditor.value = `# Seu primeiro código Python!\n# Experimente seu código aqui.`;
      }
    }
  } catch (error) {
    // Captura erros gerais de rede ou parsing de JSON
    displayErrorMessage(
      'Erro de Carregamento',
      `Ocorreu um problema ao carregar a lição: ${error.message}. Por favor, tente novamente.`
    );
    console.error('Loading lesson error:', error);
  }
});

// Função auxiliar para exibir mensagens de erro/status
function displayErrorMessage(title, message) {
  document.getElementById('lesson-title-tag').textContent = `Erro: ${title}`;
  document.getElementById('lesson-header-title').textContent = `Erro: ${title}`;

  const conceptsContainer = document.getElementById(
    'lesson-concepts-container'
  );
  conceptsContainer.innerHTML = `
        <section style="text-align: center; color: var(--text-dark);">
            <h2 style="color:var(--mario-red); text-shadow: 2px 2px 0px rgba(0,0,0,0.2);">${title}</h2>
            <p style="font-size: 1.1em; line-height: 1.5;">${message}</p>
            <p>
                <a href="../index.html" class="back-to-map-button">Voltar ao Mapa das Fases</a>
            </p>
        </section>
    `;
  // Limpa a seção de exercícios para não mostrar conteúdo antigo
  document.getElementById('lesson-exercises-container').innerHTML = ``;
}
