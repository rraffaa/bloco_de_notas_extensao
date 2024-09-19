import { applyStyle } from '../src/js/popup.js';

test('deve aplicar a tag de estilo especificada ao texto selecionado', () => {
  document.body.innerHTML = `<div id="nota"><p>Olá Mundo</p></div>`;
  const divNota = document.getElementById('nota');
  const selecao = window.getSelection();
  const intervalo = document.createRange();
  intervalo.selectNodeContents(divNota);
  selecao.removeAllRanges();
  selecao.addRange(intervalo);

  applyStyle('b');
  const textoEstilizado = divNota.innerHTML;
  expect(textoEstilizado).toBe('<b>Teste de estilo abcdefghij</b>');
});

document.body.innerHTML = `<div id="nota"><p>Texto de Teste</p></div>`;
applyStyle('b');
applyStyle('i');
expect(divNota.innerHTML).toBe('<b><i>Texto de Teste</i></b>');
