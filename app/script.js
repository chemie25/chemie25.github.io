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

// current
let flashcards_stack_counts = new Array();
let flashcards_stack = new Array();
let stack_index = 0;

const audio_button = document.getElementById("audio-button");
const audio_right  = document.getElementById("audio-right");
const audio_wrong  = document.getElementById("audio-wrong");

function loadFlashcardsCounts() {
    const flashcards_counts_map = JSON.parse(localStorage.getItem("flashcards_counts")) || new Map();

    flashcards_counts = new Array();
    for (let i = 0; i < flashcards.length; i++) {
        const id = getFlashcardId(flashcards[i]);
        const count = flashcards_counts_map[id];

        // add count to array if the flashcard is present in counts_map
        // else add the default
        flashcards_counts.push(count || {r: 0, w: 0, f: false});
    }
}

function setFlashcardsCounts() {
    const flashcards_counts_map = new Map();

    for (let i = 0; i < flashcards.length; i++) {
        const count = flashcards_counts[i];
        const id = getFlashcardId(flashcards[i]);

        flashcards_counts_map[id] = count;
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
    document.getElementById("button_skip").disabled     = !canNext();

    setHTML({"flashcard-number": (stack_index + 1) + " / " + flashcards_stack.length})

    updateFlashcard();
}

function updateFlashcard() {
    const flashcard = flashcards_stack[stack_index];
    const count = flashcards_stack_counts[stack_index];

    const table = {
        'flashcard_front': flashcard.f, 
        'flashcard_back': flashcard.b, 
        'counts': "(" + count.w + "x falsch " +  count.r + "x richtig)", 
    };
    
    setHTML(table);
    
    document.getElementById("checkbox-favourite").checked = count.f;
}

function getCatalog(marked_only = false) {
    const catalog = [];
    for (let j = 0; j < flashcards.length; j++)  {
        if (marked_only && !flashcards_counts[j].f) {
            continue;
        }
        catalog.push({'flashcard': flashcards[j], 'counts': flashcards_counts[j]});
    }
    return catalog;
}

function generateStack(max_stack_size, marked_only) {
    
    //1) combine all flashcards and their counts into list 
    const catalog = getCatalog(marked_only);
    
    //2) sort:
    catalog.sort(function(a, b) {
        // if negative, a is sorted before b

        // first the questions that have not been answered at all
        const a0 = (a.counts.r + a.counts.w) == 0;
        const b0 = (b.counts.r + b.counts.w) == 0;
        
        if (a0 == 0 || b0 == 0) {
            return ((a0 && b0) ? 0.5 - Math.random() : (a0 ? -1 : 1));
        }
        
        // then based on the difference between right and wrong
        const deltaA = a.counts.r - a.counts.w;
        const deltaB = b.counts.r - b.counts.w;
        return ((deltaA > deltaB) ? -1 : ((deltaA == deltaB) ? 0.5 - Math.random() : 1));
    });
    
    //3) generate the stack
    flashcards_stack = new Array();
    flashcards_stack_counts = new Array();
    for (let k = 0; k < catalog.length && k < max_stack_size; k++) {
        flashcards_stack.push(catalog[k].flashcard);
        flashcards_stack_counts.push(catalog[k].counts);
    }
}

function onLoad() {
    loadFlashcardsCounts();
    onStackSettingsChange();
}

function onStackSettingsChange() {
    let max_stack_size = document.getElementById("stack-size").value;
    max_stack_size = (max_stack_size == "Alle") ? Infinity : parseInt(max_stack_size);

    const marked_only = document.getElementById("stack-marked-only").checked;

    generateStack(max_stack_size, marked_only);
    update();
}

function changeFavourite() {
    const f = document.getElementById("checkbox-favourite").checked;
    flashcards_stack_counts[stack_index].f = f;
    setFlashcardsCounts();
}

// TODO
// 1. increase the right count for this flashcard
// 2. store the right count (for this flashcard)
// 3. change to the next flashcard
function buttonRight() {
    flashcards_stack_counts[stack_index].r++;
    setFlashcardsCounts();

    // skip to next 
    if (canNext()) {
        stack_index++;
    }
    update();
    audio_right.play();
};

function buttonWrong() {
    flashcards_stack_counts[stack_index].w++;
    setFlashcardsCounts();

    update();
    audio_wrong.play();
};

function canNext() { return stack_index + 1 < flashcards_stack.length; }
function canPrevious() { return stack_index - 1 >= 0; }

function nextFlashcard() {
    if (canNext()) {
        stack_index++;
        update();
    }
    audio_button.play();
};

function previousFlashcard() {
    if (canPrevious()) {
        stack_index--;
        update();
    }
    audio_button.play();
};
