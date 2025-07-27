// scripts/load_lesson_content.js

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  // Elementos HTML para preencher
  const lessonTitleTag = document.getElementById('lesson-title-tag'); // Título do <head>
  const lessonTitle = document.getElementById('lesson-title'); // Título principal <h1>
  const lessonNameSpan = document.getElementById('lesson-name'); // Dentro do parágrafo introdutório
  const lessonTopicSpan = document.getElementById('lesson-topic'); // Dentro do parágrafo introdutório
  const lessonTextIntro = document.querySelector('#lesson-text-content > p'); // O primeiro <p> da seção

  // Elementos para o Exemplo de Código Interativo
  const codeExampleSection = document.getElementById('code-example'); // A seção inteira do exemplo de código
  const htmlCodePre = document.getElementById('html-code'); // <pre><code> para HTML
  const cssCodePre = document.getElementById('css-code'); // <pre><code> para CSS
  const codeOutput = document.getElementById('code-output'); // <div> para o resultado renderizado

  const explanationText = document.getElementById('explanation-text'); // <p> para a explicação
  const hintButton = document.getElementById('show-hint-button'); // Botão de dica
  const hintTextDiv = document.getElementById('hint-text'); // Div da dica

  let lessonIndexData = []; // Para armazenar o índice de todas as lições
  let currentLessonIndex = -1; // Índice da lição atual no array lessonIndexData

  // --- Função para exibir mensagens de erro ---
  function displayErrorMessage(title, message) {
    if (lessonTitleTag) lessonTitleTag.textContent = `Erro: ${title}`;
    if (lessonTitle) lessonTitle.textContent = `Erro: ${title}`;
    if (lessonTextIntro) {
      lessonTextIntro.innerHTML = `
            <h2 style="color:var(--brawl-red); text-shadow: 2px 2px 0px rgba(0,0,0,0.2);">${title}</h2>
            <p style="font-size: 1.1em; line-height: 1.5;">${message}</p>
            <p style="margin-top: 20px;">
                <a href="index.html" class="start-adventure-button">Voltar ao Mapa das Arenas</a>
            </p>
        `;
    }
    // Oculta outras seções se houver erro
    if (codeExampleSection) codeExampleSection.style.display = 'none'; // Esconde a seção de exemplo de código
    if (explanationText) explanationText.parentElement.style.display = 'none';
    if (hintButton) hintButton.style.display = 'none';
    if (hintTextDiv) hintTextDiv.style.display = 'none';
    if (lessonTopicsList) lessonTopicsList.innerHTML = '';
  }

  // --- Carregar o Índice das Lições ---
  try {
    const response = await fetch('data/lesson_index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    lessonIndexData = await response.json();
    currentLessonIndex = lessonIndexData.findIndex(
      (lesson) => lesson.id === lessonId
    );
  } catch (error) {
    console.error('Erro ao carregar lesson_index.json:', error);
    displayErrorMessage(
      'Erro de Dados',
      `Não foi possível carregar o índice das lições. Verifique o arquivo 'data/lesson_index.json'.`
    );
    return;
  }

  // --- Função para renderizar o conteúdo da lição ---
  async function renderLesson(id) {
    let lesson = null;
    try {
      const response = await fetch(`data/lessons/${id}.json`); // Busca o JSON da lição específica
      if (!response.ok) {
        if (response.status === 404) {
          displayErrorMessage(
            'Arena em Construção!',
            `A Arena com ID "${id}" ainda está sendo construída. Volte em breve para continuar sua batalha na web!`
          );
        } else {
          throw new Error(
            `Erro ao carregar lição ${id}: ${response.statusText} (${response.status})`
          );
        }
        return;
      }
      lesson = await response.json();
    } catch (error) {
      console.error(`Erro ao carregar o arquivo da lição ${id}.json:`, error);
      displayErrorMessage(
        'Erro de Carregamento',
        `Ocorreu um problema ao carregar a Arena: ${error.message}.`
      );
      return;
    }

    if (!lesson) {
      // Redundância, mas garante
      displayErrorMessage(
        'Arena Não Encontrada',
        `A Arena com ID "${id}" não existe ou não pôde ser carregada.`
      );
      return;
    }

    // Atualiza o localStorage para o progresso
    localStorage.setItem('currentLessonId', id);
    localStorage.setItem(`lesson_${id}`, 'visited'); // Marca a lição como visitada

    // Atualiza o título do head
    if (lessonTitleTag) {
      lessonTitleTag.textContent = `${lesson.name || lesson.title}: ${
        lesson.title
      } - Brawl Stars Web Adventures`;
    }
    // Atualiza o título principal <h1>
    if (lessonTitle) {
      lessonTitle.textContent = lesson.title;
    }
    // Atualiza o texto introdutório (o primeiro <p> da seção lesson-text-content)
    if (lessonTextIntro) {
      lessonTextIntro.innerHTML = `Bem-vindo à <span id="lesson-name">${
        lesson.name || ''
      }</span>! Prepare-se para aprender tudo sobre <span id="lesson-topic">${
        lesson.topic || ''
      }</span> no universo de Brawl Stars.`;
    }

    // Limpa o conteúdo dinâmico anterior antes de adicionar o novo
    const dynamicContentContainer = document.getElementById(
      'lesson-text-content'
    );
    // Remove todos os filhos exceto o primeiro parágrafo introdutório
    Array.from(dynamicContentContainer.children).forEach((child, index) => {
      if (index > 0) {
        // Keep the first <p> which is the intro
        child.remove();
      }
    });

    // --- Injeta Conceitos (Concepts) ---
    if (lesson.concepts && lesson.concepts.length > 0) {
      lesson.concepts.forEach((concept) => {
        const section = document.createElement('section');
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
        if (concept.code) {
          // Este é para snippets de código dentro do texto
          const pre = document.createElement('pre');
          const code = document.createElement('code');
          // Assumindo que os snippets de código serão HTML ou CSS para este projeto
          code.classList.add('language-html'); // Ou 'language-css', ou determine dinamicamente
          code.textContent = concept.code;
          pre.appendChild(code);
          section.appendChild(pre);
        }
        dynamicContentContainer.appendChild(section);
      });
    }

    // --- Preenche o Exemplo de Código Interativo (Playground) ---
    if (lesson.interactiveHtmlCode || lesson.interactiveCssCode) {
      if (codeExampleSection) codeExampleSection.style.display = 'block'; // Mostra a seção
      if (htmlCodePre)
        htmlCodePre.textContent = lesson.interactiveHtmlCode || '';
      if (cssCodePre) {
        cssCodePre.textContent = lesson.interactiveCssCode || '';
        cssCodePre.parentElement.style.display = lesson.interactiveCssCode
          ? 'block'
          : 'none';
      }

      if (codeOutput) {
        codeOutput.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = 'auto';
        iframe.style.minHeight = '200px';
        iframe.style.border = '1px solid var(--brawl-yellow)';
        iframe.style.backgroundColor = 'var(--bg-light)';
        iframe.style.borderRadius = '8px';
        iframe.style.marginBottom = '15px';

        iframe.setAttribute(
          'sandbox',
          'allow-popups allow-pointer-lock allow-same-origin allow-scripts allow-forms'
        );

        iframe.onload = () => {
          const iframeBody = iframe.contentWindow.document.body;
          if (iframeBody) {
            iframe.style.height = iframeBody.scrollHeight + 30 + 'px';
          }
        };

        codeOutput.appendChild(iframe);

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${lesson.interactiveCssCode || ''}</style>
                </head>
                <body>
                    ${lesson.interactiveHtmlCode || ''}
                </body>
                </html>
            `);
        iframeDoc.close();
      }
    } else {
      if (codeExampleSection) codeExampleSection.style.display = 'none'; // Esconde se não houver código interativo
    }

    // --- Injeta Exercícios (Exercises) ---
    if (lesson.exercises && lesson.exercises.length > 0) {
      const exercisesBlock = document.createElement('section');
      exercisesBlock.classList.add(
        'lesson-block',
        'lesson-block--exercises-group'
      );
      exercisesBlock.innerHTML = `<h2>Exercícios: Hora de Codificar!</h2><p>Use o "Exemplo de Código" acima para resolver estes desafios.</p>`;

      let exercisesListDiv = document.createElement('div');
      exercisesListDiv.className = 'exercise-list-container';
      exercisesBlock.appendChild(exercisesListDiv);

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
          // Assumindo que as dicas de código são HTML ou CSS
          hintCode.className = 'language-html'; // ou 'language-css'
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
            if (typeof hljs !== 'undefined') {
              hljs.highlightElement(hintCode);
            } // Highlight hint code
          });
        }
        exercisesListDiv.appendChild(exerciseDiv);
      });
      dynamicContentContainer.appendChild(exercisesBlock);
    }

    // --- Injeta Projeto (Project) ---
    if (lesson.project) {
      const projectBlock = document.createElement('section');
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

      dynamicContentContainer.appendChild(projectBlock);
    }

    // --- Injeta Sugestão de Vídeo (Video Suggestion) ---
    if (lesson.video_suggestion) {
      const videoBlock = document.createElement('section');
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
      dynamicContentContainer.appendChild(videoBlock);
    }

    // Atualiza a explicação (seção separada no day.html)
    if (explanationText) explanationText.innerHTML = lesson.explanation || ''; // Use explanation se existir

    // Gerencia a exibição da dica
    if (hintTextDiv && hintButton) {
      if (lesson.hint) {
        hintTextDiv.innerHTML = lesson.hint;
        hintButton.style.display = 'block';
        hintTextDiv.style.display = 'none'; // Esconde a dica por padrão
        hintButton.textContent = 'Ver Dica';
      } else {
        hintTextDiv.innerHTML = '';
        hintButton.style.display = 'none';
      }
    }

    // Garante que o Highlight.js processe o novo conteúdo
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }

    // Atualiza o status da lição no mapa principal
    if (typeof updateLessonStatusOnMap === 'function') {
      updateLessonStatusOnMap();
    }
    populateLessonTopicsSidebar(); // Re-popula para marcar a lição atual
  }

  // Helper function to extract YouTube video ID
  function getYouTubeVideoId(url) {
    const regExp =
      /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }

  // --- Obtém o ID da lição da URL ---
  function getLessonIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  // --- Inicialização ---
  const initialLessonId = getLessonIdFromUrl();
  if (initialLessonId && currentLessonIndex !== -1) {
    renderLesson(initialLessonId);
  } else {
    const lastVisitedLessonId = localStorage.getItem('currentLessonId');
    if (
      lastVisitedLessonId &&
      lessonIndexData.some((l) => l.id === lastVisitedLessonId)
    ) {
      currentLessonIndex = lessonIndexData.findIndex(
        (l) => l.id === lastVisitedLessonId
      );
      renderLesson(lastVisitedLessonId);
    } else if (lessonIndexData.length > 0) {
      currentLessonIndex = 0;
      renderLesson(lessonIndexData[0].id);
    } else {
      displayErrorMessage(
        'Nenhuma Arena Disponível',
        'Não há lições configuradas no arquivo `data/lesson_index.json`.'
      );
    }
  }
});
