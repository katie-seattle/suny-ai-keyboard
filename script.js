<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Virtual Keyboard</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --bg: #14161f;
    --panel: #1c1f2b;
    --keycap: #262a38;
    --keycap-top: #2f3444;
    --keycap-active: #3a4157;
    --accent: #ffb454;
    --accent-dim: #7a5c2e;
    --text: #e8e6e0;
    --text-dim: #8b8fa3;
    --glow: rgba(255, 180, 84, 0.35);
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  html, body {
    height: 100%;
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    overscroll-behavior: none;
  }

  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    padding: clamp(10px, 3vw, 28px);
    gap: clamp(10px, 2vw, 18px);
  }

  .app {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2vw, 16px);
  }

  .screen-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(10px, 1.4vw, 12px);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .screen-label .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--glow);
    display: inline-block;
    margin-right: 6px;
  }

  #output {
    width: 100%;
    min-height: clamp(90px, 18vw, 150px);
    background: var(--panel);
    color: var(--text);
    border: 1px solid #2a2e3c;
    border-radius: 12px;
    padding: clamp(12px, 2.4vw, 20px);
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(14px, 2.2vw, 18px);
    line-height: 1.6;
    resize: none;
    outline: none;
    caret-color: var(--accent);
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.35);
  }

  #output::placeholder { color: var(--text-dim); }

  #keyboard {
    display: flex;
    flex-direction: column;
    gap: clamp(5px, 1vw, 8px);
    background: var(--panel);
    padding: clamp(8px, 1.6vw, 14px);
    border-radius: 14px;
    border: 1px solid #2a2e3c;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .keyboard-row {
    display: flex;
    gap: clamp(4px, 0.8vw, 7px);
  }

  .key {
    flex: 1;
    min-width: 0;
    background: linear-gradient(180deg, var(--keycap-top), var(--keycap));
    color: var(--text);
    border: none;
    border-bottom: 3px solid #10121a;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    font-size: clamp(11px, 2vw, 16px);
    padding: clamp(9px, 2vw, 15px) 2px;
    cursor: pointer;
    transition: transform 0.06s ease, background 0.06s ease, border-color 0.06s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .key.key-wide { flex: 1.6; }
  .key.key-space { flex: 6; }

  .key.active,
  .key.shift-locked {
    background: linear-gradient(180deg, var(--accent), #d99340);
    color: #1a1206;
    border-bottom-color: var(--accent-dim);
  }

  .key.pressed-highlight,
  .key:active {
    transform: translateY(2px);
    border-bottom-width: 1px;
    background: var(--keycap-active);
  }

  .hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(10px, 1.3vw, 12px);
    color: var(--text-dim);
    text-align: center;
  }

  /* Small phone tuning */
  @media (max-width: 420px) {
    .key { border-radius: 6px; border-bottom-width: 2px; }
    #keyboard { border-radius: 10px; }
  }
</style>
</head>
<body>
  <div class="app">
    <div class="screen-label"><span><span class="dot"></span>INPUT</span><span id="modeLabel">QWERTY</span></div>
    <textarea id="output" placeholder="Start typing…" spellcheck="false"></textarea>
    <div id="keyboard"></div>
    <div class="hint">Hold ⌫ to repeat-delete · swipe the space bar left/right to move the cursor</div>
  </div>

<script>
// ============================================================
// Virtual Keyboard Application
// A fully interactive on-screen keyboard with QWERTY layout,
// emoji support, shift/caps lock, hardware key mirroring,
// and touch/gesture support for phones and tablets.
// ============================================================

// --- DOM References ---
const output = document.getElementById("output");
const keyboard = document.getElementById("keyboard");
const modeLabel = document.getElementById("modeLabel");

// --- Keyboard State Flags ---
let isShift = false;
let isShiftLocked = false;
let isCaps = false;
let currentLayoutMode = "qwerty"; // "qwerty" or "emoji"

// --- Audio & Timing State ---
let audioCtx = null;
let lastShiftClickTime = 0;
let emojiPageIndex = 0;

// --- Backspace long-press repeat state ---
let backspaceRepeatTimeout = null;
let backspaceRepeatInterval = null;

// --- Spacebar swipe-to-move-cursor gesture state ---
let spaceSwipeActive = false;
let spaceSwipeStartX = 0;
let spaceSwipeLastStepX = 0;
const SWIPE_STEP_PX = 18; // px of drag per single character move

// ============================================================
// LAYOUT DEFINITIONS
// ============================================================

// Standard QWERTY layout. Only ONE delete/backspace key now exists,
// living at the end of the top row (previously "Delete"'s slot).
const qwertyLayout = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
    ["😀", "Space"]  // Bottom row: emoji toggle + spacebar only
];

// 3-page emoji library.
const emojiPages = [
    [
        ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
        ["🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚"],
        ["😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩"],
        ["🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣"]
    ],
    [
        ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞"],
        ["🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍"],
        ["👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝"],
        ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"]
    ],
    [
        ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨"],
        ["🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊"],
        ["🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉"],
        ["🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌"]
    ]
];

// Shift-modified symbols for the number row / punctuation.
const shiftReplacements = {
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+",
    "[": "{", "]": "}", "\\": "|", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?"
};

// Physical keyboard key → virtual key identifier.
const hardwareKeyMap = {
    "escape": "ABC", "backspace": "Backspace", "delete": "Backspace", "tab": "Tab",
    "enter": "Enter", "capslock": "Caps", "shift": "Shift", " ": "Space"
};

// ============================================================
// KEYBOARD RENDERING
// ============================================================

function createKeyboard() {
    keyboard.innerHTML = "";

    let activeLayout = [];
    if (currentLayoutMode === "qwerty") {
        activeLayout = qwertyLayout;
        modeLabel.textContent = "QWERTY";
    } else {
        activeLayout = [...emojiPages[emojiPageIndex]];
        activeLayout.push(["ABC", "◀", "▶", "Space", "Backspace"]);
        modeLabel.textContent = "EMOJI " + (emojiPageIndex + 1) + "/" + emojiPages.length;
    }

    activeLayout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        row.forEach(key => {
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add("key");
            button.textContent = getVisualText(key);
            button.setAttribute("data-key", key.toLowerCase());

            if (key === "Caps" && isCaps) button.classList.add("active");
            if (key === "Shift" && isShiftLocked) button.classList.add("shift-locked");
            if (key === "Shift" && isShift && !isShiftLocked) button.classList.add("active");

            if (["Backspace", "Tab", "Caps", "Enter", "Shift", "ABC", "◀", "▶"].includes(key) || (key === "😀" && currentLayoutMode === "qwerty")) {
                button.classList.add("key-wide");
            } else if (key === "Space") {
                button.classList.add("key-space");
            }

            attachKeyGestures(button, key);
            rowDiv.appendChild(button);
        });

        keyboard.appendChild(rowDiv);
    });
}

// ============================================================
// VISUAL TEXT LOGIC
// ============================================================

function getVisualText(key) {
    if (["Backspace", "Tab", "Caps", "Enter", "Shift", "Space", "ABC", "😀", "◀", "▶"].includes(key)) {
        if (key === "Backspace") return "⌫";
        if (key === "Space") return "␣";
        return key;
    }

    if (isShift || isShiftLocked) {
        if (shiftReplacements[key]) return shiftReplacements[key];
        return isCaps ? key.toLowerCase() : key.toUpperCase();
    }

    if (isCaps && key.match(/^[a-z]$/i)) {
        return key.toUpperCase();
    }

    return key.toLowerCase();
}

// ============================================================
// AUDIO FEEDBACK
// ============================================================

function playClickSound() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
        console.log("Audio dropped: ", e);
    }
}

// ============================================================
// SHIFT / SHIFT LOCK LOGIC
// ============================================================

function triggerShiftToggle() {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastShiftClickTime;

    if (timeDifference < 300) {
        isShiftLocked = true;
        isShift = false;
    } else {
        if (isShiftLocked) {
            isShiftLocked = false;
            isShift = false;
        } else {
            isShift = !isShift;
        }
    }
    lastShiftClickTime = currentTime;
    createKeyboard();
}

// ============================================================
// DELETE HELPER (shared by tap + long-press repeat)
// ============================================================

function deleteOneCharacterBeforeCursor() {
    const startPos = output.selectionStart;
    const endPos = output.selectionEnd;
    const textValue = output.value;

    let textBefore = textValue.substring(0, startPos);
    let textAfter = textValue.substring(endPos);
    let newCursorPos = startPos;

    if (startPos !== endPos) {
        output.value = textBefore + textAfter;
        newCursorPos = startPos;
    } else if (startPos > 0) {
        const leftArray = Array.from(textBefore);
        leftArray.pop();
        textBefore = leftArray.join("");
        output.value = textBefore + textAfter;
        newCursorPos = textBefore.length;
    }

    output.focus();
    output.setSelectionRange(newCursorPos, newCursorPos);
}

function startBackspaceRepeat() {
    stopBackspaceRepeat();
    // Small initial delay before repeat kicks in, like a physical key.
    backspaceRepeatTimeout = setTimeout(() => {
        backspaceRepeatInterval = setInterval(() => {
            deleteOneCharacterBeforeCursor();
            playClickSound();
        }, 60);
    }, 350);
}

function stopBackspaceRepeat() {
    clearTimeout(backspaceRepeatTimeout);
    clearInterval(backspaceRepeatInterval);
    backspaceRepeatTimeout = null;
    backspaceRepeatInterval = null;
}

// ============================================================
// KEY PRESS HANDLER (Core Logic — fires on tap / click release)
// ============================================================

function handleKeyPress(key) {
    playClickSound();

    const startPos = output.selectionStart;
    const endPos = output.selectionEnd;
    const textValue = output.value;

    let textBefore = textValue.substring(0, startPos);
    let textAfter = textValue.substring(endPos);
    let newCursorPos = startPos;

    switch (key) {
        case "ABC":
            currentLayoutMode = "qwerty";
            createKeyboard();
            break;

        case "😀":
            if (currentLayoutMode === "qwerty") {
                currentLayoutMode = "emoji";
                emojiPageIndex = 0;
                createKeyboard();
            } else {
                output.value = textBefore + key + textAfter;
                newCursorPos += key.length;
            }
            break;

        case "◀":
            emojiPageIndex = (emojiPageIndex - 1 + emojiPages.length) % emojiPages.length;
            createKeyboard();
            break;

        case "▶":
            emojiPageIndex = (emojiPageIndex + 1) % emojiPages.length;
            createKeyboard();
            break;

        case "Backspace":
            deleteOneCharacterBeforeCursor();
            return; // deleteOneCharacterBeforeCursor already manages focus/cursor

        case "Tab":
            output.value = textBefore + "    " + textAfter;
            newCursorPos += 4;
            break;
        case "Enter":
            output.value = textBefore + "\n" + textAfter;
            newCursorPos += 1;
            break;
        case "Space":
            output.value = textBefore + " " + textAfter;
            newCursorPos += 1;
            break;

        case "Caps":
            isCaps = !isCaps;
            createKeyboard();
            break;
        case "Shift":
            triggerShiftToggle();
            break;

        default:
            let insertedChar = "";
            if (currentLayoutMode === "emoji") {
                insertedChar = key;
            } else {
                if (isShift || isShiftLocked) {
                    insertedChar = shiftReplacements[key] || (isCaps ? key.toLowerCase() : key.toUpperCase());
                    if (!isShiftLocked) isShift = false;
                    createKeyboard();
                } else if (isCaps && key.match(/^[a-z]$/i)) {
                    insertedChar = key.toUpperCase();
                } else {
                    insertedChar = key.toLowerCase();
                }
            }

            output.value = textBefore + insertedChar + textAfter;
            newCursorPos += insertedChar.length;
            break;
    }

    output.focus();
    output.setSelectionRange(newCursorPos, newCursorPos);
}

// ============================================================
// GESTURE HANDLING (mouse + touch + pen, unified via Pointer Events)
// ============================================================

/**
 * Attaches unified pointer-based gestures to a key button so that
 * taps feel instant on touchscreens (no 300ms click delay), the
 * Backspace key supports press-and-hold repeat delete, and the
 * Space key supports a left/right swipe to move the text cursor
 * (the same gesture used by iOS/Android keyboards).
 */
function attachKeyGestures(button, key) {
    button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        button.classList.add("pressed-highlight");

        if (key === "Backspace") {
            deleteOneCharacterBeforeCursor();
            playClickSound();
            startBackspaceRepeat();
        } else if (key === "Space") {
            spaceSwipeActive = true;
            spaceSwipeStartX = e.clientX;
            spaceSwipeLastStepX = e.clientX;
        }
    });

    button.addEventListener("pointermove", (e) => {
        if (key === "Space" && spaceSwipeActive) {
            const delta = e.clientX - spaceSwipeLastStepX;
            if (Math.abs(delta) >= SWIPE_STEP_PX) {
                const steps = Math.trunc(delta / SWIPE_STEP_PX);
                moveCursorBy(steps);
                spaceSwipeLastStepX += steps * SWIPE_STEP_PX;
            }
        }
    });

    const release = (e) => {
        button.classList.remove("pressed-highlight");

        if (key === "Backspace") {
            stopBackspaceRepeat();
        } else if (key === "Space") {
            const totalDrag = Math.abs(e.clientX - spaceSwipeStartX);
            spaceSwipeActive = false;
            // Only insert a space if this was a tap, not a cursor-moving swipe.
            if (totalDrag < SWIPE_STEP_PX) {
                handleKeyPress(key);
            }
        } else {
            handleKeyPress(key);
        }
    };

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", () => {
        button.classList.remove("pressed-highlight");
        stopBackspaceRepeat();
        spaceSwipeActive = false;
    });
    button.addEventListener("pointerleave", () => {
        // Keep repeat/swipe active even if the pointer drifts slightly off
        // the key while held, matching mobile keyboard behavior.
    });
}

function moveCursorBy(steps) {
    const len = output.value.length;
    let pos = output.selectionStart + steps;
    pos = Math.max(0, Math.min(len, pos));
    output.focus();
    output.setSelectionRange(pos, pos);
    playClickSound();
}

// ============================================================
// HARDWARE KEYBOARD EVENT LISTENERS
// ============================================================

document.addEventListener("keydown", (e) => {
    const lookupKey = hardwareKeyMap[e.key.toLowerCase()] || e.key.toLowerCase();
    const targetButton = document.querySelector(`.key[data-key="${lookupKey}"]`);

    if (targetButton) {
        targetButton.classList.add("pressed-highlight");
        playClickSound();
    }

    if (e.key === "CapsLock") {
        isCaps = e.getModifierState("CapsLock");
        createKeyboard();
    }

    if (e.key === "Shift") {
        triggerShiftToggle();
    }
});

document.addEventListener("keyup", (e) => {
    const lookupKey = hardwareKeyMap[e.key.toLowerCase()] || e.key.toLowerCase();
    const targetButton = document.querySelector(`.key[data-key="${lookupKey}"]`);

    if (targetButton) {
        targetButton.classList.remove("pressed-highlight");
    }
});

// ============================================================
// INITIALIZATION
// ============================================================
createKeyboard();
</script>
</body>
</html>
