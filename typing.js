const words = 'Pratik is a creature of habit and a relentless seeker of knowledge. His days are carefully organized, filled with coding, reading, and working out. He spends ten to twelve hours a day focused on software engineering, which he treats as his most important pursuit. Java is his first love in programming, and he starts by building a strong base with it. Next, he learns Data Structures and Algorithms, crucial for solving problems efficiently. With these basics in place, Pratik dives into web development, obsessed with the MERN stack. He creates project after project, each showcasing his growing skills in this vast field.Pratik’s curiosity drives him to explore deeper topics like TypeScript, Next.js, and DevOps tools such as Kafka and Kubernetes. He envisions managing complex systems and using data to create impactful solutions. Despite his intense focus, he pays attention to his physical and mental well-being. The gym becomes his sanctuary, where he follows a rigorous workout routine each morning, combining push-ups and pull-ups with the same discipline he applies to his studies.Surprisingly, the gym leads him to a new passion: cooking. He grows tired of packaged food and starts experimenting in the kitchen, finding joy in turning raw ingredients into delicious dishes. When the stress of work becomes overwhelming, Pratik turns to anime and video games. These provide him with a needed escape and moments of pure enjoyment.Pratik is a mix of different roles: the disciplined scholar, the dedicated athlete, the passionate cook, and the gamer. While these aspects of his life seem different, they all contribute to who he is becoming. Each part of his routine helps him inch closer to his ideal self. Though he faces challenges and setbacks, his determination keeps him moving forward. His journey is one of ongoing self-improvement and professional growth, with every line of code, every workout, and every meal shaping his future.'.split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;
window.totalTypedCharacters = 0;
window.correctTypedCharacters = 0;

function addClass(el,name) {
  el.className += ' '+name;
}
function removeClass(el,name) {
  el.className = el.className.replace(name,'');
}

function randomWord() {
  const randomIndex = Math.ceil(Math.random() * wordsCount);
  return words[randomIndex - 1];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  document.getElementById('words').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = (gameTime / 1000) + '';
  window.timer = null;
  window.totalTypedCharacters = 0;
  window.correctTypedCharacters = 0;
}

function getWpm() {
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
    const correctLetters = letters.filter(letter => letter.className.includes('correct'));
    return incorrectLetters.length === 0 && correctLetters.length === letters.length;
  });
  return correctWords.length / gameTime * 60000;
}

function getAccuracy() {
  return window.totalTypedCharacters === 0 ? 0 : (window.correctTypedCharacters / window.totalTypedCharacters) * 100;
}


function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  const wpm = getWpm();
  const accuracy = getAccuracy();
  document.getElementById('info').innerHTML = `WPM: ${wpm.toFixed(2)}, Accuracy: ${accuracy.toFixed(2)}%`;
}

document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  console.log({key,expected});

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = (new Date()).getTime();
      }
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.round((gameTime / 1000) - sPassed);
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + '';
    }, 1000);
  }

  if (isLetter) {
    window.totalTypedCharacters++;
    if (currentLetter) {
      addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
      if (key === expected) {
        window.correctTypedCharacters++;
      }
      removeClass(currentLetter, 'current');
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
    } else {
      const incorrectLetter = document.createElement('span');
      incorrectLetter.innerHTML = key;
      incorrectLetter.className = 'letter incorrect extra';
      currentWord.appendChild(incorrectLetter);
    }
  }
  

  if (isSpace) {
    if (expected !== ' ') {
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect');
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }
    addClass(currentWord.nextSibling.firstChild, 'current');
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      // make prev word current, last letter current
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    if (currentLetter && !isFirstLetter) {
      // move back one letter, invalidate letter
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    }
    if (!currentLetter) {
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }
  }

  // move lines / words
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }

  // move cursor
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
  cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
});


document.getElementById('newGameBtn').addEventListener('click', () => {
  gameOver();
  newGame();
});

newGame();