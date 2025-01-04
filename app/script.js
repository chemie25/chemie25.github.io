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
let flashcards = new Array();

let current_index = 0;

function loadFlashcards() {
    const flashcards_str = '[{"f": "Front 1", "b": "Back 1"}, {"f": "Front 2", "b": "Back 2"}, {"f": "Front 3", "b": "Back 3"}]';
    flashcards = JSON.parse(flashcards_str);
}

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
        document.getElementById(id).innerHTML = content;
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
        'count_right': count.r, 
        'count_wrong': count.w, 
    };
    
    setHTML(table);
}


function onLoad() {
    // loading
    loadFlashcards();
    loadFlashcardsCounts();

    // sort flashcards for training priority

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
    nextFlashcard();

    update();
};

function buttonWrong() {
    flashcards_counts[current_index].w++;
    setFlashcardsCounts();

    update();
};

function canNext() { return current_index + 1 < flashcards.length; }
function canPrevious() { return current_index - 1 >= 0; }

function nextFlashcard() {
    if (canNext()) {
        current_index++;
        update();
    }
};

function previousFlashcard() {
    if (canPrevious()) {
        current_index--;
        update();
    }
};
