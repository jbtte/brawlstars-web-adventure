// scripts/day_ide.js

// Variáveis globais para o Pyodide e elementos do DOM
let pyodide = null;
let pythonEditor = null;
let pythonOutput = null;
let runButton = null;
let statusSpan = null;

// Função assíncrona para carregar o Pyodide
async function loadPyodideAndSetup() {
  statusSpan.textContent = 'Carregando IDE...';
  statusSpan.classList.add('status-loading');

  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
    });
    statusSpan.textContent = 'Pronto para codificar!';
    statusSpan.classList.remove('status-loading');
    statusSpan.classList.add('status-ready');
    runButton.disabled = false; // Habilita o botão de executar

    // Importa sys e StringIO para capturar a saída de print() e erros
    await pyodide.runPythonAsync(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
            sys.stderr = StringIO()
        `);
  } catch (error) {
    statusSpan.textContent = 'Erro ao carregar IDE.';
    statusSpan.classList.remove('status-loading');
    statusSpan.classList.add('status-error');
    console.error('Failed to load Pyodide:', error);
  }
}

// Função para executar o código Python
async function executePythonCode() {
  pythonOutput.textContent = 'Executando...';
  pythonOutput.style.color = ''; // Reseta a cor para o padrão (preto/claro)

  const code = pythonEditor.value;

  try {
    // Limpa os buffers de saída antes de cada execução
    await pyodide.runPythonAsync(
      'sys.stdout.seek(0); sys.stdout.truncate(0); sys.stderr.seek(0); sys.stderr.truncate(0);'
    );

    // Executa o código Python
    await pyodide.runPythonAsync(code);

    // Captura a saída do stdout e stderr
    const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
    const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

    if (stdout) {
      pythonOutput.textContent = stdout;
    } else if (stderr) {
      pythonOutput.textContent = stderr;
      pythonOutput.style.color = 'red'; // Erros em vermelho
    } else {
      pythonOutput.textContent = 'Execução concluída sem saída.';
    }
  } catch (error) {
    // Se houver um erro de Python que não foi capturado por sys.stderr
    pythonOutput.textContent =
      'Erro Python:\n' + (error.message || error.toString());
    pythonOutput.style.color = 'red';
    console.error('Python execution error:', error);
  }
}

// Inicializa quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  // Captura as referências dos elementos do DOM
  pythonEditor = document.getElementById('python-code-editor');
  pythonOutput = document.getElementById('python-output');
  runButton = document.getElementById('run-python-code');
  statusSpan = document.getElementById('pyodide-status');

  // Verifica se todos os elementos necessários foram encontrados
  if (!pythonEditor || !pythonOutput || !runButton || !statusSpan) {
    console.error(
      'Um ou mais elementos do IDE não foram encontrados no DOM. Verifique os IDs.'
    );
    if (statusSpan) {
      statusSpan.textContent = 'Erro de inicialização.';
      statusSpan.classList.add('status-error');
    }
    return; // Sai da função se os elementos não forem encontrados
  }

  // Adiciona o listener ao botão de executar código
  runButton.addEventListener('click', executePythonCode);

  // Inicia o carregamento do Pyodide
  loadPyodideAndSetup();
});
