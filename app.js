const textBox = document.getElementById('text-box');
const lettersPanel = document.getElementById('letters-panel');
const emojiSection = document.getElementById('emoji-section');
const emojiPanel = document.getElementById('emoji-panel');
const categoryTitle = document.getElementById('category-title');
const prevCategoryBtn = document.getElementById('prev-category-btn');
const nextCategoryBtn = document.getElementById('next-category-btn');
const toggleBtn = document.getElementById('toggle-btn');
const backspaceBtn = document.getElementById('backspace-btn');
const keyboardArea = document.getElementById('keyboard-area');

// 1. Define 3 Emoji Categories
const emojiCategories = [
  {
    name: "1. Smileys & Expressions",
    emojis: ["😀", "😂", "😍", "🥳", "😎", "😭", "😴", "🤔", "😊", "🤯", "😡", "😜", "😌", "🎓", "🎉", "🔥", "💯", "✨"]
  },
  {
    name: "2. Animals & Nature",
    emojis: ["🐶", "🐱", "🦁", "🐸", "🐵", "🐼", "🦊", "🐯", "🐻", "🐨", "🐰", "🦄", "🦋", "🐝", "🌸", "🍀", "🌞", "⭐"]
  },
  {
    name: "3. Food & Travel",
    emojis: ["🍕", "🍔", "🍟", "🍦", "🍩", "🍣", "🌮", "🍎", "🚀", "✈️", "🏖️", "🚗", "🏀", "⚽", "🎮", "🎧", "🍿", "☕"]
  }
];

let currentCategoryIndex = 0;

// Render current emoji category
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

// Category Arrow Navigation
prevCategoryBtn.addEventListener('click', () => {
  currentCategoryIndex = (currentCategoryIndex - 1 + emojiCategories.length) % emojiCategories.length;
  renderEmojiCategory(currentCategoryIndex);
});

nextCategoryBtn.addEventListener('click', () => {
  currentCategoryIndex = (currentCategoryIndex + 1) % emojiCategories.length;
  renderEmojiCategory(currentCategoryIndex);
});

// Initialize First Category
renderEmojiCategory(currentCategoryIndex);

// 2. Render QWERTY Letter Keys
const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

keys.forEach(letter => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'key';
  btn.innerText = letter;

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    textBox.value += letter;
  });

  lettersPanel.appendChild(btn);
});

// 3. Switch between Letter Keyboard & Emoji Section
let showingEmoji = false;
toggleBtn.addEventListener('click', () => {
  showingEmoji = !showingEmoji;
  lettersPanel.style.display = showingEmoji ? 'none' : 'grid';
  emojiSection.style.display = showingEmoji ? 'flex' : 'none';
  toggleBtn.innerText = showingEmoji ? 'Switch to Letters (ABC)' : 'Switch to Emoji (😀)';
});

// 4. Backspace
backspaceBtn.addEventListener('click', () => {
  textBox.value = textBox.value.slice(0, -1);
});

// 5. Touch Gesture Listener
// - Swipe Left: Backspace / Delete
// - Swipe Right (when in emoji view): Next Category
let touchStartX = 0;
let touchEndX = 0;

keyboardArea.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

keyboardArea.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}, false);

function handleSwipeGesture() {
  const swipeDistance = touchStartX - touchEndX;
  const threshold = 50; // Minimum distance in pixels

  if (swipeDistance > threshold) {
    // Swiped left -> backspace
    textBox.value = textBox.value.slice(0, -1);
  } else if (swipeDistance < -threshold && showingEmoji) {
    // Swiped right while on emoji panel -> cycle to next category
    currentCategoryIndex = (currentCategoryIndex + 1) % emojiCategories.length;
    renderEmojiCategory(currentCategoryIndex);
  }
}