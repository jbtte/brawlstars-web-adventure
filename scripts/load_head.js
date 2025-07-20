document.addEventListener('DOMContentLoaded', function() {
    fetch('includes/head_template.html') // Ou 'includes/head_template.html' se você criar uma pasta 'includes'
        .then(response => response.text())
        .then(data => {
            document.head.innerHTML = data;
            // Se o título estiver no template, ele será sobrescrito aqui.
            // Se você quiser títulos específicos para cada página, terá que ajustar.
            // Exemplo para um título dinâmico (opcional):
            // if (document.title.includes("day.html")) {
            //     document.title = "Arena Específica - Brawl Stars Web Adventures";
            // } else {
            //     document.title = "Brawl Stars Web Adventures: Desvendando o HTML & CSS";
            // }
        })
        .catch(error => console.error('Erro ao carregar o head:', error));
});