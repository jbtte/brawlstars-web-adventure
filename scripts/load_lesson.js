// scripts/load_lesson.js

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  // --- CORREÇÃO AQUI: Garante que os containers referenciem o HTML correto ---
  const lessonTitleTag = document.getElementById('lesson-title-tag');
  const lessonHeaderTitle = document.getElementById('lesson-header-title');
  // 'conceptsContainer' será o principal ponto de injeção para TUDO (conceitos, projeto, video)
  const conceptsContainer = document.getElementById(
    'lesson-concepts-container'
  );
  // 'exercisesContainer' é a SECTION onde o DIV da lista de exercícios vai.
  const exercisesSectionHTML = document.getElementById(
    'lesson-exercises-container'
  );
  // 'videoSectionHTML' é a SECTION HTML original para o vídeo, que vamos esconder.
  const videoSectionHTML = document.getElementById('video-suggestion-section');
  // FIM CORREÇÃO ---

  if (
    !lessonTitleTag ||
    !lessonHeaderTitle ||
    !conceptsContainer ||
    !exercisesSectionHTML || // Usando a referência à SECTION HTML
    !videoSectionHTML
  ) {
    console.error(
      'Critical HTML elements for lesson loading are missing. Check day.html IDs.'
    );
    if (lessonHeaderTitle)
      lessonHeaderTitle.textContent = 'Erro: Estrutura da Página Incompleta';
    return;
  }

  if (!lessonId) {
    displayErrorMessage(
      'Lição Não Especificada',
      'Por favor, selecione uma lição válida no mapa.',
      lessonTitleTag,
      lessonHeaderTitle,
      conceptsContainer,
      exercisesSectionHTML // Passando a referência correta
    );
    return;
  }

  try {
    const response = await fetch(`lessons/${lessonId}.json`);
    if (!response.ok) {
      if (response.status === 404) {
        displayErrorMessage(
          'Lição em Construção!',
          `A Fase **${lessonId.replace(
            'day',
            'Dia '
          )}** ainda está sendo codificada. Volte em breve para continuar sua aventura!`,
          lessonTitleTag,
          lessonHeaderTitle,
          conceptsContainer,
          exercisesSectionHTML // Passando a referência correta
        );
      } else {
        throw new Error(
          `Erro ao carregar lição: ${response.statusText} (${response.status})`
        );
      }
      return;
    }
    const lesson = await response.json();

    // Marcar lição como visitada no localStorage
    if (typeof Storage !== 'undefined') {
      localStorage.setItem(`lesson_${lessonId}`, 'visited');
      console.log(`Lição ${lessonId} marcada como visitada no localStorage.`);
    } else {
      console.warn(
        'Seu navegador não suporta localStorage. O progresso da lição não será salvo.'
      );
    }

    // Update page title and header
    lessonTitleTag.textContent = lesson.title;
    lessonHeaderTitle.textContent = lesson.title;

    // --- ORDEM DE INJEÇÃO (TODOS OS BLOCOS SERÃO INJETADOS NO CONCEPTS_CONTAINER) ---

    // 1. Limpa o container principal de conceitos para evitar duplicação
    conceptsContainer.innerHTML = '';

    // 2. Injeta os Conceitos (Concepts)
    if (lesson.concepts && lesson.concepts.length > 0) {
      lesson.concepts.forEach((concept) => {
        const section = document.createElement('section'); // Cria uma nova SECTION para cada conceito
        section.classList.add('lesson-block', `lesson-block--${concept.type}`);

        if (concept.heading) {
          const heading = document.createElement('h2');
          heading.innerHTML = concept.heading;
          section.appendChild(heading);
        }
        if (concept.text) {
          const text = document.createElement('p');
          text.innerHTML = concept.text;
          section.appendChild(text);
        }
        if (concept.steps && concept.steps.length > 0) {
          const stepsList = document.createElement('ol');
          stepsList.classList.add('lesson-steps');
          concept.steps.forEach((step) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = step;
            stepsList.appendChild(listItem);
          });
          section.appendChild(stepsList);
        }
        if (concept.image_placeholder) {
          const imgPlaceholder = document.createElement('div');
          imgPlaceholder.classList.add('image-placeholder');
          if (concept.image_url) {
            const img = document.createElement('img');
            img.src = concept.image_url;
            img.alt = concept.image_placeholder;
            imgPlaceholder.appendChild(img);
          } else {
            imgPlaceholder.innerHTML = `<p>${concept.image_placeholder}</p>`;
          }
          section.appendChild(imgPlaceholder);
        }
        if (concept.type === 'code' && concept.code) {
          const pre = document.createElement('pre');
          const code = document.createElement('code');
          code.classList.add('language-python');
          code.textContent = concept.code;
          pre.appendChild(code);
          section.appendChild(pre);
        }
        conceptsContainer.appendChild(section); // Anexa ao container principal
      });
    }

    // 3. Injeta Exercícios (SEMPRE depois dos conceitos)
    // Cria uma NOVA SECTION para os exercícios.
    const exercisesBlock = document.createElement('section');
    exercisesBlock.classList.add(
      'lesson-block',
      'lesson-block--exercises-group'
    );
    // Adiciona o H2 e o P introdutório dos exercícios
    exercisesBlock.innerHTML = `<h2>Exercícios: Hora de Codificar!</h2><p>Use o "Seu Playground Python!" acima para resolver estes desafios. Cole seu código lá e execute para testar!</p>`;

    let exercisesListDiv = document.createElement('div'); // A lista de itens de exercício
    exercisesListDiv.className = 'exercise-list-container';
    exercisesBlock.appendChild(exercisesListDiv); // Anexa a lista ao novo bloco de exercícios

    if (lesson.exercises && lesson.exercises.length > 0) {
      lesson.exercises.forEach((exercise) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add(
          'exercise-item',
          `exercise-item--${exercise.type}`
        );

        const prompt = document.createElement('p');
        prompt.innerHTML = exercise.prompt;
        exerciseDiv.appendChild(prompt);

        if (exercise.code_hint) {
          const showHintButton = document.createElement('button');
          showHintButton.className = 'show-hint-button';
          showHintButton.textContent = 'Ver Dica de Código';
          exerciseDiv.appendChild(showHintButton);

          const hintContainer = document.createElement('div');
          hintContainer.className = 'hint-container hidden';

          const hintPre = document.createElement('pre');
          const hintCode = document.createElement('code');
          hintCode.className = 'language-python';
          hintCode.textContent = exercise.code_hint;
          hintPre.appendChild(hintCode);
          hintContainer.appendChild(hintPre);

          exerciseDiv.appendChild(hintContainer);

          showHintButton.addEventListener('click', () => {
            hintContainer.classList.toggle('hidden');
            if (hintContainer.classList.contains('hidden')) {
              showHintButton.textContent = 'Ver Dica de Código';
            } else {
              showHintButton.textContent = 'Esconder Dica';
            }
          });
        }
        exercisesListDiv.appendChild(exerciseDiv);
      });
    } else {
      exercisesListDiv.innerHTML = `<p>Nenhum exercício disponível para esta lição ainda. Continue a aventura na próxima fase!</p>`;
    }
    conceptsContainer.appendChild(exercisesBlock); // Anexa o bloco de exercícios ao container principal

    // 4. Injeta Projeto (SEMPRE depois dos exercícios)
    if (lesson.project) {
      const projectBlock = document.createElement('section'); // Cria uma nova SECTION para o projeto
      projectBlock.classList.add(
        'lesson-block',
        `lesson-block--${lesson.project.type}`
      );

      const heading = document.createElement('h2');
      heading.textContent = lesson.project.name;
      projectBlock.appendChild(heading);

      const description = document.createElement('p');
      description.innerHTML = lesson.project.description;
      projectBlock.appendChild(description);

      const goal = document.createElement('p');
      goal.innerHTML = `<strong>Objetivo:</strong> ${lesson.project.goal}`;
      projectBlock.appendChild(goal);

      conceptsContainer.appendChild(projectBlock); // Anexa ao container principal
    }

    // 5. Injeta Sugestão de Vídeo (SEMPRE depois do projeto)
    if (lesson.video_suggestion) {
      const videoBlock = document.createElement('section'); // Cria uma nova SECTION para o vídeo
      videoBlock.classList.add(
        'lesson-block',
        `lesson-block--${lesson.video_suggestion.type}`
      );

      const heading = document.createElement('h2');
      heading.textContent = 'Vídeo Complementar';
      videoBlock.appendChild(heading);

      const text = document.createElement('p');
      text.innerHTML = lesson.video_suggestion.text;
      videoBlock.appendChild(text);

      const videoEmbedDiv = document.createElement('div');
      videoEmbedDiv.classList.add('video-embed-container');

      const youtubeId = getYouTubeVideoId(lesson.video_suggestion.url);
      if (youtubeId) {
        const videoIframe = document.createElement('iframe');
        videoIframe.setAttribute(
          'src',
          `https://www.youtube.com/embed/${youtubeId}?cc_lang_pref=pt&cc_load_policy=1&hl=pt`
        );
        videoIframe.setAttribute('frameborder', '0');
        videoIframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        );
        videoIframe.setAttribute('allowfullscreen', '');
        videoIframe.setAttribute('title', 'Sugestão de Vídeo');
        videoEmbedDiv.appendChild(videoIframe);
      } else {
        console.error(
          'ID do YouTube não pôde ser extraído da URL:',
          lesson.video_suggestion.url
        );
        videoEmbedDiv.innerHTML =
          "<p style='color: red;'>Erro: Vídeo não disponível ou URL inválida.</p>";
      }

      videoBlock.appendChild(videoEmbedDiv);
      conceptsContainer.appendChild(videoBlock); // Anexa ao container principal
    }

    // --- Limpeza de Placeholders HTML ORIGINAIS ---
    // Agora que todos os blocos são criados via JS, escondemos os placeholders HTML originais
    // A section#lesson-exercises-container é a única que precisa ser escondida ou seu conteúdo limpo
    // como o JS agora cria sua própria section para exercícios, podemos limpar o original.
    if (exercisesSectionHTML) {
      exercisesSectionHTML.innerHTML = ''; // Limpa totalmente o placeholder original de exercícios
      exercisesSectionHTML.style.display = 'none'; // E esconde, caso ainda tenha padding/margem
    }
    if (videoSectionHTML) {
      // Esconde o placeholder original do vídeo
      videoSectionHTML.innerHTML = ''; // Limpa o conteúdo original
      videoSectionHTML.style.display = 'none';
    }

    // Garante que o Highlight.js processe o novo conteúdo
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }
  } catch (error) {
    displayErrorMessage(
      'Erro de Carregamento',
      `Ocorreu um problema ao carregar a lição: ${error.message}. Por favor, tente novamente.`,
      lessonTitleTag,
      lessonHeaderTitle,
      conceptsContainer,
      exercisesSectionHTML // Passando a referência correta
    );
    console.error('Loading lesson error:', error);
  }
});

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url) {
  const regExp =
    /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

// Function to display error messages
function displayErrorMessage(
  title,
  message,
  lessonTitleTag,
  lessonHeaderTitle,
  conceptsContainer,
  exercisesSectionHTML // Usando o nome correto
) {
  if (lessonTitleTag) lessonTitleTag.textContent = `Erro: ${title}`;
  if (lessonHeaderTitle) lessonHeaderTitle.textContent = `Erro: ${title}`;

  if (conceptsContainer) {
    conceptsContainer.innerHTML = `
            <section style="text-align: center; color: var(--text-dark);">
                <h2 style="color:var(--mario-red); text-shadow: 2px 2px 0px rgba(0,0,0,0.2);">${title}</h2>
                <p style="font-size: 1.1em; line-height: 1.5;">${message}</p>
                <p style="margin-top: 20px;">
                    <a href="index.html" class="back-to-map-button">Voltar ao Mapa das Fases</a>
                </p>
            </section>
        `;
  }
  // Esconde os placeholders originais para evitar duplicação ou conteúdo indesejado
  if (exercisesSectionHTML) {
    exercisesSectionHTML.innerHTML = '';
    exercisesSectionHTML.style.display = 'none';
  }
  const videoSectionHTML = document.getElementById('video-suggestion-section');
  if (videoSectionHTML) {
    videoSectionHTML.innerHTML = '';
    videoSectionHTML.style.display = 'none';
  }
  const ideSection = document.querySelector('.interactive-ide-section');
  if (ideSection) ideSection.style.display = 'none';
}
