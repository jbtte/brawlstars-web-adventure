// scripts/load_lesson.js

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  const lessonTitleTag = document.getElementById('lesson-title-tag');
  const lessonHeaderTitle = document.getElementById('lesson-header-title');
  const conceptsContainer = document.getElementById(
    'lesson-concepts-container'
  );
  const exercisesContainer = document.getElementById(
    'lesson-exercises-container'
  );
  const videoSection = document.getElementById('video-suggestion-section');

  if (
    !lessonTitleTag ||
    !lessonHeaderTitle ||
    !conceptsContainer ||
    !exercisesContainer ||
    !videoSection
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
      exercisesContainer
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
          exercisesContainer
        );
      } else {
        throw new Error(
          `Erro ao carregar lição: ${response.statusText} (${response.status})`
        );
      }
      return;
    }

    const lesson = await response.json();

    if (typeof Storage !== 'undefined') {
      localStorage.setItem(`lesson_${lessonId}`, 'visited');
      console.log(`Lição ${lessonId} marcada como visitada no localStorage.`);
    } else {
      console.warn(
        'Seu navegador não suporta localStorage. O progresso da lição não será salvo.'
      );
    }

    lessonTitleTag.textContent = lesson.title;
    lessonHeaderTitle.textContent = lesson.title;

    conceptsContainer.innerHTML = '';
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

      if (concept.type === 'code' && concept.code) {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.classList.add('language-python');
        code.textContent = concept.code;
        pre.appendChild(code);
        section.appendChild(pre);
      }

      conceptsContainer.appendChild(section);
    });

    const exercisesContainerElem = document.getElementById(
      'lesson-exercises-container'
    );
    let exercisesListDiv = exercisesContainerElem.querySelector(
      '.exercise-list-container'
    );
    if (exercisesListDiv) {
      exercisesListDiv.innerHTML = '';
    } else {
      exercisesListDiv = document.createElement('div');
      exercisesListDiv.className = 'exercise-list-container';
      exercisesContainerElem.appendChild(exercisesListDiv);
    }

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
            showHintButton.textContent = hintContainer.classList.contains(
              'hidden'
            )
              ? 'Ver Dica de Código'
              : 'Esconder Dica';
          });
        }
        exercisesListDiv.appendChild(exerciseDiv);
      });
    } else {
      exercisesListDiv.innerHTML = `<p>Nenhum exercício disponível para esta lição ainda. Continue a aventura na próxima fase!</p>`;
    }

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

      conceptsContainer.appendChild(projectBlock);
    }

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

      const videoIframe = document.createElement('iframe');
      videoIframe.setAttribute('width', '560');
      videoIframe.setAttribute('height', '315');
      videoIframe.setAttribute('src', lesson.video_suggestion.url);
      videoIframe.setAttribute('frameborder', '0');
      videoIframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );
      videoIframe.setAttribute('allowfullscreen', '');
      videoIframe.setAttribute('title', 'Sugestão de Vídeo');

      videoEmbedDiv.appendChild(videoIframe);
      videoBlock.appendChild(videoEmbedDiv);

      conceptsContainer.appendChild(videoBlock);
    } else {
      if (videoSection) videoSection.style.display = 'none';
    }

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
      exercisesContainer
    );
    console.error('Loading lesson error:', error);
  }
});

function getYouTubeVideoId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function displayErrorMessage(
  title,
  message,
  lessonTitleTag,
  lessonHeaderTitle,
  conceptsContainer,
  exercisesContainer
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
  if (exercisesContainer) exercisesContainer.innerHTML = ``;

  const videoSection = document.getElementById('video-suggestion-section');
  if (videoSection) videoSection.style.display = 'none';

  const ideSection = document.querySelector('.interactive-ide-section');
  if (ideSection) ideSection.style.display = 'none';
}
