(() => {
  const url = document.querySelector('link[rel="canonical"]').href;
  const button = document.querySelector('#shareGame');
  const feedback = document.querySelector('#shareFeedback');
  const dialog = document.querySelector('#shareFallback');
  const manual = document.querySelector('#shareText');
  let score = null;
  let resetFeedback;

  document.addEventListener('waves-run-start', () => {
    score = null;
    button.textContent = 'SHARE GAME';
    feedback.textContent = '';
    clearTimeout(resetFeedback);
  });
  document.addEventListener('waves-run-end', ({detail}) => {
    if (!Number.isSafeInteger(detail) || detail <= 0) return;
    score = detail;
    button.textContent = 'SHARE SCORE';
  });

  button.addEventListener('click', async () => {
    const text = score === null
      ? 'Drop the needle on Waves of Light, an arcade shooter set to the music of lowQ.'
      : `I scored ${score.toLocaleString('en')} in Waves of Light. Can you beat my score?`;
    const message = text + '\n' + url;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({title: 'Waves of Light', text, url});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(score === null ? url : message);
      feedback.textContent = score === null ? 'Game link copied.' : 'Score and game link copied.';
      clearTimeout(resetFeedback);
      resetFeedback = setTimeout(() => { feedback.textContent = ''; }, 2800);
    } catch {
      manual.value = score === null ? url : message;
      dialog.showModal();
      manual.select();
    }
  });
})();
