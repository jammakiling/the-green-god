const gameContainer = document.querySelector(".game-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = true;
let tries = 0;
let score = 0;
let timeLeft = 60;
let timeInterval;

//function for loading screen play button
document.querySelector(".play-btn").addEventListener("click", function () {
  document.querySelector(".game-screen").classList.remove("hidden");
  document.querySelector(".loading-screen").style.display = "none";
});

//function for starting game and hiding instruction modal
document.querySelector(".start-btn").addEventListener("click", function () {
  console.log("Start button clicked!");
  document.querySelector(".instruct-modal").classList.add("hidden");
  lockBoard = false;
  startTimer();
});

//tries variable assigned as text of tries class
document.querySelector(".tries").textContent = tries;
document.querySelector(".score").textContent = score;

//json file of card object array is fetched , parsed and loaded into new array where it is duplicated twice (for pairs)
fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [];

    data.forEach((entry) => {
      // Image card
      cards.push({
        type: "image",
        name: entry.hex,
        image: entry.image,
        label: entry.name,
      });

      // Label card
      cards.push({
        type: "label",
        name: entry.hex,
        hex: entry.hex,
        label: entry.name,
      });
    });

    shuffleCards();
    generateCards();
  });

//Fisher-Yates Shuffle Algorithm to randomize cardds
function shuffleCards() {
  //declaring 3 vars
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  //while curerntIndex isnt 0
  while (currentIndex !== 0) {
    //get random number from 0 to currentindex-1
    randomIndex = Math.floor(Math.random() * currentIndex);
    //decrement currentindex
    currentIndex -= 1;
    //shuffle cards
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

//generate cards in game after shuffling json array
function generateCards() {
  //go thru each card
  for (let card of cards) {
    //create div element with classes and attributes
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    //makeinnerhtml for that div
    cardElement.innerHTML = `
    <div class="front">
      ${
        card.type === "image"
          ? `<img class="front-image" src="${card.image}" alt="${card.label}"/>`
          : `<div class="front-hex funnel-sans">${card.hex}</div>`
      }
    </div>
    <div class="back"></div>`;
    //display the generated card to the grid container in the game
    gameContainer.appendChild(cardElement);
    //assigning a function to react to a click
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  //check if board is locked then stop function
  if (lockBoard) return;
  //if card is clicked twice then stop
  if (this === firstCard) return;

  //add flip class to clicked  card so card flips regardless if its the first or second card
  this.classList.add("flipped");

  //if no card has been flipped yet , then assign first var

  if (!firstCard) {
    firstCard = this;
    return;
  }

  //if its the second card store it as second then update tries (tries is just amount of tries not actual tries)

  secondCard = this;
  tries++;
  document.querySelector(".tries").textContent = tries;
  lockBoard = true;
  //check if the two cards match
  checkForMatch();
}

function checkForMatch() {
  //check the data-name attribute of twocards
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  //if isMatch is true then make cards unclickable if its false then flip them back
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  //remove clickable functionality for the matched cards
  score++;
  document.querySelector(".score").textContent = score;
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  if (score === cards.length / 2) {
    winGame();
  }

  //resetvariables

  resetBoard();
}

function unflipCards() {
  //when  2 cards dont match, create 1 second delay before it flips back
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  if (timeLeft > 0) {
    lockBoard = false;
  }
}

function restart() {
  clearInterval(timeInterval);
  gameContainer.classList.remove("disabled");
  lockBoard = false;
  resetBoard();
  shuffleCards();
  tries = 0;
  score = 0;
  timeLeft = 60;
  document.querySelector(".tries").textContent = tries;
  document.querySelector(".score").textContent = score;
  gameContainer.innerHTML = "";
  generateCards();
  startTimer();
}

//add timer

function startTimer() {
  timeInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.querySelector(".timer").textContent = `00:${
        timeLeft < 10 ? "0" : ""
      }${timeLeft} `;
    } else {
      clearInterval(timeInterval);
      document.querySelector(".timer").textContent = "00:00 ";
      alert("Time's up! Try again.");
      lockBoard = true;
      gameContainer.classList.add("disabled");
    }
  }, 1000);
}

function winGame() {
  clearInterval(timeInterval);
  alert("Congrats!");
  lockBoard = true;
}
