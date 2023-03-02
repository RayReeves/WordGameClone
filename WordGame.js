const WORD_OF_DAY = "https://words.dev-apis.com/word-of-the-day";
const VALIDATION_URL = "https://words.dev-apis.com/validate-word";
let gameOver = false;
let gameAnswer = getWordOfDay();
const gameBody = document.getElementById('game-body');
let rowNumber = 0;
let index = 0;
let currentGuess = document.getElementsByClassName("game-row")[rowNumber];
let currentInput = currentGuess.querySelectorAll(".letter-box")[index];

// gets word of the day from the Front End Masters API and sets our answer as an array
async function getWordOfDay() {
  const promise = await fetch(WORD_OF_DAY);
  const processedResponse = await promise.json()
  gameAnswer = Array.from(processedResponse.word);
}

// 
async function validateGuess(guess) {
  let loader = document.querySelector(".endgame");
  loader.classList.add("loader");
  const promise = await fetch(VALIDATION_URL, {
    "method": "POST",
    "body": JSON.stringify({"word": `${guess}`})
  })
  results =  await promise.json();
  let valid = results.validWord;
  loader.classList.remove("loader");
  return valid;
}

// format the guess into a string
function formatGuessWord() {
  let letters = [];
  for (let i = 0; i < 5; i++) {
    letters.push(currentGuess.querySelectorAll(".letter-box")[i].value)
  }
  return guess = letters.join("");
}

// regex function that checks that input is an alphabetical character
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// ensures we are in the correct input box for the guess row
function selectBox() {
  currentInput = currentGuess.querySelectorAll(".letter-box")[index];
  currentInput.focus()
}

// when a guess is entered, moves to the next guess row
function selectCurrentGuess() {
  rowNumber += 1;
  currentGuess = document.getElementsByClassName("game-row")[rowNumber];
}

// takes the accepted letter from user input and places in current input box
function inputLetter(letter) {
  if (index <= 4) {
    currentInput.value = letter;
    index += 1;
    currentInput.classList.add('has-letter');
  }
  if (index < 5) {
    selectBox()
  }
}

// this function looks at specific situations to determine what to delete, and where to delete it from
function useBackspace() {
  if (currentInput.value === '' && index > 0) {
    index -= 1;
    selectBox()
    currentInput.value = currentInput.value.substring(0, currentInput.length - 1);
  } else if (index === 5) {
    currentInput.value = currentInput.value.substring(0, currentInput.length - 1);
    index -= 1;
  } else {
    currentInput.value = currentInput.value.substring(0, currentInput.length - 1);
  }
  currentInput.classList.remove('has-letter');
}

// method to enter the guess, including validate the word is accepted then check against word of day.
function enterGuess() {
  word = formatGuessWord();
  validateGuess(word).then(function (valid) {
    if (valid) {
      checkForLetterMatch()
      if (currentGuess.querySelectorAll('.letter-in-correct-place').length === 5) {
        endgameWin()
        gameOver = true;
      } else {
        if (rowNumber < 5) {
          index = 0;
          selectCurrentGuess()
          selectBox()
        } else {
          endgameLose()
          gameOver = true;
        }
      }
    } else {
      invalidWord()
    }
  });
}

function addInvalidWordClass() {
  for (let i = 0; i < 5; i++) {
    currentGuess.querySelectorAll(".letter-box")[i].classList.add("invalid-word");
  }
}

function removeInvalidWordClass() {
  for (let i = 0; i < 5; i++) {
    currentGuess.querySelectorAll(".letter-box")[i].classList.remove("invalid-word");
  }
}

// flashes red to show a word is invalid
function invalidWord() {
  addInvalidWordClass();

  setTimeout(function() {
    removeInvalidWordClass()
  }, 1500);
}

// checks each letter to look for a map/inclusion
// follows up to ensure incorrectly duplicate letters show as incorrect
function checkForLetterMatch() {
  let answerClone = [...gameAnswer];
  for (let i = 0; i < 5; i++) {
    if (currentGuess.querySelectorAll(".letter-box")[i].value.toLowerCase() === answerClone[i].toLowerCase()){
      answerClone[i] = "";
      currentGuess.querySelectorAll(".letter-box")[i].classList.add("letter-in-correct-place");
    } else if (answerClone.includes(currentGuess.querySelectorAll(".letter-box")[i].value.toLowerCase())) {
      currentGuess.querySelectorAll(".letter-box")[i].classList.add("good-letter-wrong-place");
    } else {
      currentGuess.querySelectorAll(".letter-box")[i].classList.add("bad-letter");
    }
  }
  // go back and double check for bad repeat letters
  let kindaOkay = currentGuess.querySelectorAll(".good-letter-wrong-place");
  for (let i = 0; i < kindaOkay.length; i++) {
    if ((!answerClone.includes(kindaOkay[i].value.toLowerCase()))) {
      kindaOkay[i].classList.add("bad-letter");
    } else {
      answerClone[answerClone.indexOf(kindaOkay[i].value)] = ""; // finds the firs index of the answer clone letter and removes it prevent false duplicates
    }
  }
}

function endgameWin() {
  const endDiv = document.querySelector(".endgame");
  const endText = document.createElement("h1");
  endText.classList.add("winner");
  endText.innerText = "YOU WIN!";
  endDiv.appendChild(endText);
}

function endgameLose() {
  const endDiv = document.querySelector(".endgame");
  const endText = document.createElement("h2");
  endText.classList.add("loser");
  endText.innerText = `The word of the day was "${gameAnswer.join("")}"`;
  endDiv.appendChild(endText);
}

// here we look for what characters the player is inputting, and acting accordingly
const keypress = document.addEventListener("keyup", function () {
  if (!gameOver) {
    if (isLetter(event.key)) {
      inputLetter(event.key)
    } else if (event.key === "Backspace") {
      useBackspace()
    } else if (event.key === "Enter" && index >= 4 && currentInput.value != '') {
      enterGuess()
    }
  } 
})

// when in game box we only want the specific input to accept characters
gameBody.addEventListener("click", selectBox)

// when in game box we want keys to work specifically
gameBody.addEventListener("keydown", function() {
  event.preventDefault()
})
