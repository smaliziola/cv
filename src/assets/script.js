(function () {
  const flipCard = document.getElementById('flipCard');
  flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('flipped');
  });

  const toggleSwitch = document.getElementById('theme-toggle');

  toggleSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    toggleSwitch.checked = true;
  }
})();
