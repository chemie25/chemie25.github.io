function getFlashcardId(flashcard) {
    return "f" + hashString(flashcard.f + flashcard.b)
}

function hashString(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

let flashcards_counts = new Array();
let current_index = 0;


const audio_button = document.getElementById("audio-button");
const audio_right = document.getElementById("audio-right");
const audio_wrong = document.getElementById("audio-wrong");


function loadFlashcardsCounts() {
    const flashcards_counts_map = JSON.parse(localStorage.getItem("flashcards_counts")) || new Map();

    flashcards_counts = new Array();
    for (let i = 0; i < flashcards.length; i++) {
        const id = getFlashcardId(flashcards[i]);
        const count = flashcards_counts_map[id];

        // add count to array if the flashcard is present in counts_map
        // else add the default
        flashcards_counts.push(count || {r: 0, w: 0});
    }
}

function setFlashcardsCounts() {
    const flashcards_counts_map = new Map();

    for (let i = 0; i < flashcards.length; i++) {
        const count = flashcards_counts[i];
        const id = getFlashcardId(flashcards[i]);

        if (count != {r: 0, w: 0}) {
            flashcards_counts_map[id] = count;
        }
    }

    localStorage.setItem("flashcards_counts", JSON.stringify(flashcards_counts_map));
}

function setHTML(table) {
    for (const [id, content] of Object.entries(table)) {
        const elem = document.getElementById(id);
        elem.innerHTML = content;

        // update katex
        if (typeof renderMathInElement === "function") { 
            // safe to use the function
            renderMathInElement(elem, {
                delimiters: [
                { left: "$$",  right: "$$",  display: true },
                { left: "$",   right: "$",   display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true }
                ]
            })
        }
    }
}

function update() {
    // update buttons
    document.getElementById("button_previous").disabled = !canPrevious();
    document.getElementById("button_skip").disabled = !canNext();

    updateFlashcard();
}

function updateFlashcard() {
    const flashcard = flashcards[current_index];
    const count = flashcards_counts[current_index];

    const table = {
        'flashcard_front': flashcard.f, 
        'flashcard_back': flashcard.b, 
        'counts': "(" + count.w + "x falsch " +  count.r + "x richtig)", 
    };
    
    setHTML(table);
}


function onLoad() {
    // loading
    loadFlashcardsCounts();

    // start
    update();
}

// TODO
// 1. increase the right count for this flashcard
// 2. store the right count (for this flashcard)
// 3. change to the next flashcard
function buttonRight() {
    flashcards_counts[current_index].r++;
    setFlashcardsCounts();

    // skip to next 
    if (canNext()) {
        current_index++;
    }
    update();
    audio_right.play();
};

function buttonWrong() {
    flashcards_counts[current_index].w++;
    setFlashcardsCounts();

    update();
    audio_wrong.play();
};

function canNext() { return current_index + 1 < flashcards.length; }
function canPrevious() { return current_index - 1 >= 0; }

function nextFlashcard() {
    if (canNext()) {
        current_index++;
        update();
    }
    audio_button.play();
};

function previousFlashcard() {
    if (canPrevious()) {
        current_index--;
        update();
    }
    audio_button.play();
};
