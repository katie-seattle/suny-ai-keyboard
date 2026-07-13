// ============================================================
// Virtual Keyboard Application
// A fully interactive on-screen keyboard with QWERTY layout,
// emoji support, shift/caps lock, and hardware key mirroring.
// ============================================================

// --- DOM References ---
const output = document.getElementById("output");       // The text area where typed characters appear
const keyboard = document.getElementById("keyboard");   // The container element for the virtual keyboard

// --- Keyboard State Flags ---
let isShift = false;            // Whether Shift is temporarily active (single press)
let isShiftLocked = false;      // Whether Shift is locked on (double-click activates lock)
let isCaps = false;             // Whether Caps Lock is toggled on
let currentLayoutMode = "qwerty"; // Current layout: "qwerty" for letters or "emoji" for emoji picker

// --- Audio & Timing State ---
let audioCtx = null;            // Web Audio API context for key click sounds (lazy-initialized)
let lastShiftClickTime = 0;     // Timestamp of last Shift press, used to detect double-click for lock
let emojiPageIndex = 0;         // Which page of the emoji grid is currently displayed (0-2)

// ============================================================
// LAYOUT DEFINITIONS
// ============================================================

// Standard QWERTY keyboard layout organized by row.
// Each sub-array represents one horizontal row of keys.
const qwertyLayout = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Delete"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
    ["😀", "Space", "Backspace"]  // Bottom row: emoji toggle, spacebar, backspace
];

// 3-page emoji library. Each page contains 4 rows of 10 emojis.
// Page 0: Faces/expressions, Page 1: Hands/hearts, Page 2: Animals
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

// Maps base characters to their Shift-modified equivalents (symbols on number row, etc.)
const shiftReplacements = {
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+",
    "[": "{", "]": "}", "\\": "|", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?"
};

// Maps physical keyboard event keys to virtual keyboard button identifiers.
// This allows highlighting the correct on-screen key when a hardware key is pressed.
const hardwareKeyMap = {
    "escape": "ABC", "backspace": "Backspace", "delete": "Delete", "tab": "Tab",
    "enter": "Enter", "capslock": "Caps", "shift": "Shift", " ": "Space"
};

// ============================================================
// KEYBOARD RENDERING
// ============================================================

/**
 * Builds and renders the entire virtual keyboard into the DOM.
 * Chooses between QWERTY layout and emoji grid based on currentLayoutMode.
 * Called initially and whenever the layout or modifier state changes.
 */
function createKeyboard() {
    keyboard.innerHTML = ""; // Clear existing keyboard

    // Determine which layout to render
    let activeLayout = [];
    if (currentLayoutMode === "qwerty") {
        activeLayout = qwertyLayout;
    } else {
        // In emoji mode, show current emoji page plus a navigation/control row
        activeLayout = [...emojiPages[emojiPageIndex]];
        activeLayout.push(["ABC", "◀", "▶", "Space", "Backspace"]); // Navigation row
    }

    // Build each row of keys
    activeLayout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        row.forEach(key => {
            const button = document.createElement("button");
            button.classList.add("key");
            button.textContent = getVisualText(key);  // Display text respects shift/caps state
            button.setAttribute("data-key", key.toLowerCase()); // Used for hardware key matching

            // Apply visual state indicators for modifier keys
            if (key === "Caps" && isCaps) button.classList.add("active");
            if (key === "Shift" && isShiftLocked) button.classList.add("shift-locked");
            if (key === "Shift" && isShift && !isShiftLocked) button.classList.add("active");

            // Apply wider styling to special/functional keys
            if (["Backspace", "Delete", "Tab", "Caps", "Enter", "Shift", "ABC", "◀", "▶"].includes(key) || (key === "😀" && currentLayoutMode === "qwerty")) {
                button.classList.add("key-wide");
            } else if (key === "Space") {
                button.classList.add("key-space"); // Extra-wide spacebar
            }

            // Attach click handler for this key
            button.addEventListener("click", () => handleKeyPress(key));
            rowDiv.appendChild(button);
        });

        keyboard.appendChild(rowDiv);
    });
}

// ============================================================
// VISUAL TEXT LOGIC
// ============================================================

/**
 * Determines what text to display on a key button, accounting for
 * Shift, Shift Lock, and Caps Lock states.
 *
 * @param {string} key - The base key identifier
 * @returns {string} - The character/label to display on the key
 */
function getVisualText(key) {
    // Special keys always display their label as-is
    if (["Backspace", "Delete", "Tab", "Caps", "Enter", "Shift", "Space", "ABC", "😀", "◀", "▶"].includes(key)) {
        return key;
    }

    // When Shift or Shift Lock is active:
    if (isShift || isShiftLocked) {
        // If key has a symbol replacement (e.g., 1 → !), use it
        if (shiftReplacements[key]) return shiftReplacements[key];
        // For letters: Shift + Caps = lowercase (they cancel out), Shift alone = uppercase
        return isCaps ? key.toLowerCase() : key.toUpperCase();
    }

    // When only Caps Lock is active, uppercase letters only
    if (isCaps && key.match(/^[a-z]$/i)) {
        return key.toUpperCase();
    }

    // Default: show lowercase
    return key.toLowerCase();
}

// ============================================================
// AUDIO FEEDBACK
// ============================================================

/**
 * Plays a short click sound using the Web Audio API.
 * Creates a brief triangle-wave oscillator that sweeps from 600Hz to 150Hz
 * over 40ms, simulating a tactile key click.
 */
function playClickSound() {
    try {
        // Lazily initialize the audio context on first use
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Resume if browser suspended it (autoplay policy)
        if (audioCtx.state === "suspended") audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Configure a short descending tone for a "click" feel
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

        // Quick fade-out to avoid audio pops
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        // Connect audio graph: oscillator → gain → speakers
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05); // Auto-stop after 50ms
    } catch (e) {
        console.log("Audio dropped: ", e);
    }
}

// ============================================================
// SHIFT / SHIFT LOCK LOGIC
// ============================================================

/**
 * Handles Shift key behavior with double-click detection:
 * - Single click: toggles temporary Shift (active for one keystroke)
 * - Double click (within 300ms): activates Shift Lock (persistent uppercase)
 * - Click while locked: deactivates Shift Lock
 */
function triggerShiftToggle() {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastShiftClickTime;

    if (timeDifference < 300) {
        // Double-click detected → enable Shift Lock
        isShiftLocked = true;
        isShift = false;
    } else {
        if (isShiftLocked) {
            // Already locked → unlock both
            isShiftLocked = false;
            isShift = false;
        } else {
            // Normal toggle of temporary Shift
            isShift = !isShift;
        }
    }
    lastShiftClickTime = currentTime;
    createKeyboard(); // Re-render to reflect new state
}

// ============================================================
// KEY PRESS HANDLER (Core Logic)
// ============================================================

/**
 * Main handler for all virtual key presses. Routes each key to its
 * appropriate action: inserting characters, navigating emoji pages,
 * toggling modifiers, or deleting text.
 *
 * Maintains cursor position in the output textarea after each action.
 *
 * @param {string} key - The key identifier that was pressed
 */
function handleKeyPress(key) {
    playClickSound(); // Audible feedback on every keypress

    // Capture current cursor/selection state in the output textarea
    const startPos = output.selectionStart;
    const endPos = output.selectionEnd;
    const textValue = output.value;

    // Split text around the current selection for easy manipulation
    let textBefore = textValue.substring(0, startPos);  // Text before cursor/selection
    let textAfter = textValue.substring(endPos);         // Text after cursor/selection
    let newCursorPos = startPos;                         // Where cursor should end up

    switch (key) {
        // --- Layout Switching ---
        case "ABC":
            // Switch back to QWERTY from emoji mode
            currentLayoutMode = "qwerty";
            createKeyboard();
            break;

        case "😀":
            // Context-dependent behavior:
            // In QWERTY mode → switch to emoji picker
            // In emoji mode → insert the 😀 character itself
            if (currentLayoutMode === "qwerty") {
                currentLayoutMode = "emoji";
                emojiPageIndex = 0; // Always start on first emoji page
                createKeyboard();
            } else {
                output.value = textBefore + key + textAfter;
                newCursorPos += key.length;
            }
            break;

        // --- Emoji Page Navigation ---
        case "◀":
            // Go to previous emoji page (wraps around to last page)
            emojiPageIndex = (emojiPageIndex - 1 + emojiPages.length) % emojiPages.length;
            createKeyboard();
            break;

        case "▶":
            // Go to next emoji page (wraps around to first page)
            emojiPageIndex = (emojiPageIndex + 1) % emojiPages.length;
            createKeyboard();
            break;

        // --- Deletion Keys ---
        case "Backspace":
            if (startPos !== endPos) {
                // Text is selected → delete the selection
                output.value = textBefore + textAfter;
            } else if (startPos > 0) {
                // No selection → delete one character before cursor
                // Uses Array.from() to correctly handle multi-byte chars (emojis)
                const leftArray = Array.from(textBefore);
                leftArray.pop();
                textBefore = leftArray.join("");
                output.value = textBefore + textAfter;
                newCursorPos = textBefore.length;
            }
            break;

        case "Delete":
            if (startPos !== endPos) {
                // Text is selected → delete the selection
                output.value = textBefore + textAfter;
            } else if (startPos < textValue.length) {
                // No selection → delete one character after cursor
                // Uses Array.from() to correctly handle multi-byte chars (emojis)
                const rightArray = Array.from(textAfter);
                rightArray.shift();
                textAfter = rightArray.join("");
                output.value = textBefore + textAfter;
            }
            break;

        // --- Whitespace & Control Keys ---
        case "Tab":
            // Insert 4 spaces (soft tab)
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

        // --- Modifier Toggles ---
        case "Caps":
            isCaps = !isCaps;
            createKeyboard(); // Re-render to show updated key labels
            break;
        case "Shift":
            triggerShiftToggle();
            break;

        // --- Character Insertion (default case) ---
        default:
            let insertedChar = "";
            if (currentLayoutMode === "emoji") {
                // In emoji mode, keys are emoji characters — insert directly
                insertedChar = key;
            } else {
                // In QWERTY mode, apply shift/caps transformations
                if (isShift || isShiftLocked) {
                    // Use symbol replacement if available, otherwise toggle case
                    insertedChar = shiftReplacements[key] || (isCaps ? key.toLowerCase() : key.toUpperCase());
                    // Single-use Shift deactivates after one character (Shift Lock persists)
                    if (!isShiftLocked) isShift = false;
                    createKeyboard(); // Re-render to show shift deactivated
                } else if (isCaps && key.match(/^[a-z]$/i)) {
                    insertedChar = key.toUpperCase();
                } else {
                    insertedChar = key.toLowerCase();
                }
            }

            // Insert the determined character at cursor position
            output.value = textBefore + insertedChar + textAfter;
            newCursorPos += insertedChar.length;
            break;
    }

    // Restore focus and set cursor to the correct position after text manipulation
    output.focus();
    output.setSelectionRange(newCursorPos, newCursorPos);
}

// ============================================================
// HARDWARE KEYBOARD EVENT LISTENERS
// These mirror physical key presses onto the virtual keyboard,
// providing visual feedback (highlight) and audio on real keystrokes.
// ============================================================

document.addEventListener("keydown", (e) => {
    // Map the hardware key to its virtual keyboard equivalent
    const lookupKey = hardwareKeyMap[e.key.toLowerCase()] || e.key.toLowerCase();
    const targetButton = document.querySelector(`.key[data-key="${lookupKey}"]`);

    // Highlight the corresponding on-screen key and play click sound
    if (targetButton) {
        targetButton.classList.add("pressed-highlight");
        playClickSound();
    }

    // Sync Caps Lock state with the actual hardware toggle
    if (e.key === "CapsLock") {
        isCaps = e.getModifierState("CapsLock");
        createKeyboard();
    }

    // Sync Shift state with hardware Shift press
    if (e.key === "Shift") {
        triggerShiftToggle();
    }
});

document.addEventListener("keyup", (e) => {
    // Remove the highlight when the physical key is released
    const lookupKey = hardwareKeyMap[e.key.toLowerCase()] || e.key.toLowerCase();
    const targetButton = document.querySelector(`.key[data-key="${lookupKey}"]`);

    if (targetButton) {
        targetButton.classList.remove("pressed-highlight");
    }
});

// ============================================================
// INITIALIZATION
// Render the keyboard on page load
// ============================================================
createKeyboard();
