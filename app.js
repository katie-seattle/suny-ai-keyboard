document.addEventListener('DOMContentLoaded', () => {
  const textBox = document.getElementById('text-box');
  const lettersPanel = document.getElementById('letters-panel');
  const emojiSection = document.getElementById('emoji-section');
  const emojiPanel = document.getElementById('emoji-panel');
  const categoryTitle = document.getElementById('category-title');
  const prevCategoryBtn = document.getElementById('prev-category-btn');
  const nextCategoryBtn = document.getElementById('next-category-btn');
  const toggleBtn = document.getElementById('toggle-btn');
  const spaceBtn = document.getElementById('space-btn');
  const returnBtn = document.getElementById('return-btn');
  const keyboardArea = document.getElementById('keyboard-area');

  // State for Shift and Caps Lock
  let isShiftActive = false;
  let isCapsLockActive = false;
  let lastShiftTapTime = 0;

  // Safe Delete Function for Unicode / Emojis
  function deleteLastCharacter() {
    const charArray = Array.from(textBox.value);
    charArray.pop();
    textBox.value = charArray.join('');
  }

  // 1. Build Standard QWERTY Layout
  const row1Keys = ['q','w','e','r','t','y','u','i','o','p'];
  const row2Keys = ['a','s','d','f','g','h','j','k','l'];
  const row3Keys = ['z','x','c','v','b','n','m'];

  const row1Container = document.getElementById('row-1');
  const row2Container = document.getElementById('row-2');
  const row3Container = document.getElementById('row-3');

  const letterButtons = [];

  function createKeyButton(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key';
    btn.innerText = label;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      
      // Determine letter casing
      const charToInsert = (isShiftActive || isCapsLockActive) ? btn.innerText.toUpperCase() : btn.innerText.toLowerCase();
      textBox.value += charToInsert;

      // If single-shift was active (and not caps lock), reset shift after typing one letter
      if (isShiftActive && !isCapsLockActive) {
        isShiftActive = false;
        updateKeyCasing();
      }
    });

    letterButtons.push(btn);
    return btn;
  }

  // Populate Letter Rows
  row1Keys.forEach(k => row1Container.appendChild(createKeyButton(k)));
  row2Keys.forEach(k => row2Container.appendChild(createKeyButton(k)));

  // Shift Key Creation
  const shiftBtn = document.createElement('button');
  shiftBtn.type = 'button';
  shiftBtn.className = 'special-key action-key';
  shiftBtn.innerText = '⇧';

  shiftBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastShiftTapTime;

    // Double tap within 300ms triggers Caps Lock
    if (tapLength < 300 && tapLength > 0) {
      isCapsLockActive = !isCapsLockActive;
      isShiftActive = isCapsLockActive;
    } else {
      if (isCapsLockActive) {
        isCapsLockActive = false;
        isShiftActive = false;
      } else {
        isShiftActive = !isShiftActive;
      }
    }

    lastShiftTapTime = currentTime;
    updateKeyCasing();
  });

  row3Container.appendChild(shiftBtn);

  row3Keys.forEach(k => row3Container.appendChild(createKeyButton(k)));

  // Backspace Key
  const backspaceBtn = document.createElement('button');
  backspaceBtn.type = 'button';
  backspaceBtn.className = 'special-key action-key';
  backspaceBtn.innerText = '⌫';
  backspaceBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    deleteLastCharacter();
  });
  row3Container.appendChild(backspaceBtn);

  // Update visual key labels based on Shift/Caps lock state
  function updateKeyCasing() {
    const shouldBeUpper = isShiftActive || isCapsLockActive;

    letterButtons.forEach(btn => {
      btn.innerText = shouldBeUpper ? btn.innerText.toUpperCase() : btn.innerText.toLowerCase();
    });

    // Style Shift button to indicate active states
    if (isCapsLockActive) {
      shiftBtn.style.background = '#3b82f6';
      shiftBtn.style.color = '#ffffff';
      shiftBtn.innerText = '⇪'; // Caps lock symbol
    } else if (isShiftActive) {
      shiftBtn.style.background = '#007aff';
      shiftBtn.style.color = '#ffffff';
      shiftBtn.innerText = '⇧';
    } else {
      shiftBtn.style.background = '#acb3bd';
      shiftBtn.style.color = '#000000';
      shiftBtn.innerText = '⇧';
    }
  }

  // 2. Space & Return Buttons
  spaceBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    textBox.value += ' ';
  });

  returnBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    textBox.value += '\n';
  });

  // 3. Emoji Categories
  const emojiCategories = [
    {
      name: "Smileys & Expressions",
      emojis: ["😀", "😂", "😍", "🥳", "😎", "😭", "😴", "🤔", "😊", "🤯", "😡", "😜", "😌", "🎓", "🎉", "🔥", "💯", "✨"]
    },
    {
      name: "Animals & Nature",
      emojis: ["🐶", "🐱", "🦁", "🐸", "🐵", "🐼", "🦊", "🐯", "🐻", "🐨", "🐰", "🦄", "🦋", "🐝", "🌸", "🍀", "🌞", "⭐"]
    },
    {
      name: "Food & Travel",
      emojis: ["🍕", "🍔", "🍟", "🍦", "🍩", "🍣", "🌮", "🍎", "🚀", "✈️", "🏖️", "🚗", "🏀", "⚽", "🎮", "🎧", "🍿", "☕"]
    }
  ];

  let currentCategoryIndex = 0;

  function renderEmojiCategory(index) {
    const category = emojiCategories[index];
    categoryTitle.innerText = category.name;
    emojiPanel.innerHTML = '';

    category.emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'key emoji-key';
      btn.innerText = emoji;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        textBox.value += emoji;
      });
      emojiPanel.appendChild(btn);
    });
  }

  prevCategoryBtn.addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex - 1 + emojiCategories.length) % emojiCategories.length;
    renderEmojiCategory(currentCategoryIndex);
  });

  nextCategoryBtn.addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex + 1) % emojiCategories.length;
    renderEmojiCategory(currentCategoryIndex);
  });

  renderEmojiCategory(currentCategoryIndex);

  // 4. Toggle Keyboard / Emoji
  let showingEmoji = false;
  toggleBtn.addEventListener('click', () => {
    showingEmoji = !showingEmoji;
    lettersPanel.style.display = showingEmoji ? 'none' : 'flex';
    emojiSection.style.display = showingEmoji ? 'flex' : 'none';
    toggleBtn.innerText = showingEmoji ? 'ABC' : '😀';
  });

  // 5. Gestures (Swipe Left -> Delete | Swipe Right on Emoji -> Next Category)
  let touchStartX = 0;
  let touchEndX = 0;

  keyboardArea.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  keyboardArea.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;
    const threshold = 50;

    if (swipeDistance > threshold) {
      deleteLastCharacter();
    } else if (swipeDistance < -threshold && showingEmoji) {
      currentCategoryIndex = (currentCategoryIndex + 1) % emojiCategories.length;
      renderEmojiCategory(currentCategoryIndex);
    }
  }, false);
});