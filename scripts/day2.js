// Exercício 1
function exercicio1() {
  const nome = prompt('Digite seu nome:');
  const idade = parseInt(prompt('Digite sua idade:'));
  const altura = parseFloat(prompt('Digite sua altura em metros:'));

  if (nome && !isNaN(idade) && !isNaN(altura)) {
    alert(`Nome: ${nome}\nIdade: ${idade}\nAltura: ${altura} metros`);
    document.getElementById('result1').textContent = 'Resposta correta!';
  } else {
    document.getElementById('result1').textContent =
      'Por favor, preencha todos os campos corretamente.';
  }
}

// Exercício 2
function exercicio2() {
  const respostas = [15, 13, 24, 5];
  const resultados = [10 + 5, 20 - 7, 4 * 6, 15 / 3];

  let corretas = 0;
  for (let i = 0; i < respostas.length; i++) {
    const resposta = parseFloat(
      prompt(`Qual é o resultado da expressão ${i + 1}?`)
    );
    if (resposta === respostas[i]) {
      corretas++;
    }
  }

  document.getElementById(
    'result2'
  ).textContent = `Você acertou ${corretas} de ${respostas.length} expressões.`;

  if (corretas === respostas.length) {
    document.getElementById('result2').textContent +=
      ' Parabéns, você acertou todas!';
  } else {
    document.getElementById('result2').textContent +=
      ' Aqui estão as respostas corretas:';
    for (let i = 0; i < resultados.length; i++) {
      document.getElementById('result2').textContent += `\n${i + 1}: ${
        resultados[i]
      }`;
    }
  }
}

// Exercício 3
function exercicio3() {
  const nota1 = parseFloat(prompt('Digite a primeira nota:'));
  const nota2 = parseFloat(prompt('Digite a segunda nota:'));
  const nota3 = parseFloat(prompt('Digite a terceira nota:'));

  if (!isNaN(nota1) && !isNaN(nota2) && !isNaN(nota3)) {
    const media = (nota1 + nota2 + nota3) / 3;
    document.getElementById(
      'result3'
    ).textContent = `A média das notas é: ${media.toFixed(2)}`;
  } else {
    document.getElementById('result3').textContent =
      'Por favor, digite todas as notas corretamente.';
  }
}

// Exercício 4
function exercicio4() {
  const base = parseFloat(prompt('Digite a base do retângulo em centímetros:'));
  const altura = parseFloat(
    prompt('Digite a altura do retângulo em centímetros:')
  );

  if (!isNaN(base) && !isNaN(altura)) {
    const area = base * altura;
    const perimetro = 2 * (base + altura);
    document.getElementById(
      'result4'
    ).textContent = `Área: ${area} cm²\nPerímetro: ${perimetro} cm`;
  } else {
    document.getElementById('result4').textContent =
      'Por favor, digite a base e a altura corretamente.';
  }
}

// Exercício 5
function exercicio5() {
  const precoProduto = 120;
  const desconto = 0.15;

  const valorDesconto = precoProduto * desconto;
  const precoFinal = precoProduto - valorDesconto;

  document.getElementById(
    'result5'
  ).textContent = `Valor do desconto: R$ ${valorDesconto.toFixed(
    2
  )}\nPreço final: R$ ${precoFinal.toFixed(2)}`;
}
