function addToHistory(text, isWin) {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  const item = document.createElement('div');
  item.className = `history-item ${isWin ? 'win' : 'lose'}`;
  item.textContent = text;
  historyList.prepend(item);

  if (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }
}
