import { applyStyle } from './path/to/your/code'; // Altere o caminho conforme necessário

test('should apply the specified style tag to selected text', () => {
  document.body.innerHTML = `<div id="note"><p>Hello World</p></div>`;
  const noteDiv = document.getElementById('note');
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(noteDiv);
  selection.removeAllRanges();
  selection.addRange(range);

  applyStyle('b');
  const styledText = noteDiv.innerHTML;
  expect(styledText).toBe('<b>Hello World</b>');
});
