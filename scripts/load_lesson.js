// scripts/load_lesson.js

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  // Make sure these elements exist before trying to set properties
  const lessonTitleTag = document.getElementById('lesson-title-tag');
  const lessonHeaderTitle = document.getElementById('lesson-header-title');
  const conceptsContainer = document.getElementById(
    'lesson-concepts-container'
  );
  const exercisesContainer = document.getElementById(
    'lesson-exercises-container'
  );
  const videoSection = document.getElementById('video-suggestion-section');

  // Basic check for essential containers
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
    return; // Stop execution if critical elements are missing
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

    // Update page title and header
    lessonTitleTag.textContent = lesson.title;
    lessonHeaderTitle.textContent = lesson.title;

    // Inject concepts
    conceptsContainer.innerHTML = '';
    lesson.concepts.forEach((concept) => {
      const section = document.createElement('section');
      const heading = document.createElement('h2'); // Changed to H2 as per standard section heading
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

    // Inject exercises
    // Clear previous exercises, but keep the fixed H2 and P if they are in the HTML
    let exercisesListDiv = exercisesContainer.querySelector(
      '.exercise-list-container'
    );
    if (exercisesListDiv) {
      exercisesListDiv.innerHTML = ''; // Clear only the dynamic list
    } else {
      exercisesListDiv = document.createElement('div');
      exercisesListDiv.className = 'exercise-list-container';
      exercisesContainer.appendChild(exercisesListDiv); // Append if it didn't exist
    }

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
    } else {
      exercisesListDiv.innerHTML = `<p>Nenhum exercício disponível para esta lição ainda. Continue a aventura na próxima fase!</p>`;
    }

    // Optional: Update IDE with initial code or first exercise hint
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

    // Add video suggestion
    if (lesson.video_suggestion && videoSection) {
      // Check if videoSection exists before manipulating
      videoSection.innerHTML = '';
      const videoHeading = document.createElement('h2');
      videoHeading.textContent = 'Aprofunde Seus Conhecimentos';
      videoSection.appendChild(videoHeading);

      const videoText = document.createElement('p');
      videoText.innerHTML = lesson.video_suggestion.text;
      videoSection.appendChild(videoText);

      const videoEmbedDiv = document.createElement('div');
      videoEmbedDiv.classList.add('video-embed-container');

      const videoIframe = document.createElement('iframe');
      videoIframe.setAttribute(
        'src',
        `https://www.youtube.com/embed/${getYouTubeVideoId(
          lesson.video_suggestion.url
        )}`
      );
      videoIframe.setAttribute('frameborder', '0');
      videoIframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );
      videoIframe.setAttribute('allowfullscreen', '');
      videoIframe.setAttribute('title', 'Sugestão de Vídeo');

      videoEmbedDiv.appendChild(videoIframe);
      videoSection.appendChild(videoEmbedDiv);
      videoSection.style.display = 'block'; // Ensure section is visible
    } else if (videoSection) {
      videoSection.style.display = 'none'; // Hide section if no video
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

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Function to display error messages (passing elements directly)
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
  // Clear exercises section content if it exists
  if (exercisesContainer) exercisesContainer.innerHTML = ``;
  // Hide video section if it exists
  const videoSection = document.getElementById('video-suggestion-section');
  if (videoSection) videoSection.style.display = 'none';

  // Also hide IDE section if it exists
  const ideSection = document.querySelector('.interactive-ide-section');
  if (ideSection) ideSection.style.display = 'none';
}
