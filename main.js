// ideas
// also exp up as pet "hover" it
// add wearables that are unlocked with pet experience?
// eventually can choose animal (unlock with user experience?)
// diff animals have diff fav foods with ultra happy status
// choose background


/*

        INITIALIZE VARIABLES

*/

// max can be changed for display purposes
var maxHunger = 1000; //
var sadHunger = maxHunger * 0.25;
// can change this for demo purposes
// passed along with hunger decreasefunction on a set interval
var gameLoopFreq = 1000;
// change  freq to longer for real game
var hungerDecreaseFreq = 10000; // (10000) 10 seconds for hunger decrease
var hungerTimer = hungerDecreaseFreq;
var poopFreq = hungerDecreaseFreq * 10;
var poopTimer = poopFreq;
var maxPoop = 77; // most poops that still fit in game field
var sadPoop = 5; //
var angryPoop = 15; // around 1 row of poop depending on screen size
// allows us to clear the interval of the game loop, for example on death
var intervalID;

// class for Pets -> will come into play with more species options
// if I want to create new pet options, should add species
class Pet {
    constructor() {
        this.hunger = maxHunger;
        this.name = "";
        this.poop = 0;
        this.experience = 0;
        this.condition = "happy";
    }
}

// initialize pet that is used in game
var pet = new Pet();

//class for the 6 foods that can be fed
class Food {
    constructor(name, hungerIncrease, poopChange, expGained, expToUnlock) {
        this.name = name;
        this.hungerIncrease = hungerIncrease;
        this.poopChange = poopChange;
        this.expGained = expGained;
        this.expToUnlock = expToUnlock;
    }
}

var apple = new Food("apple", 2, 0, 100, 0);
var fish = new Food("fish", 25, 0, 150, 5000);
var hotdog = new Food("hotdog", 50, 1, 300, 10000);
var burger = new Food("burger", 100, 2, 500, 25000);
var pizza = new Food("pizza", 150, 2, 600, 50000);
var iceCream = new Food("icecream", 200, 3, 750, 100000);

var foods = [apple, fish, hotdog, burger, pizza, iceCream];

/*

      GAME STORAGE

*/

// function to be called in Game loop that continually saves pet status
// and time stamp for hunger calculations
function saveToLocalStorage() {
    localStorage.pet = JSON.stringify(pet);
    // for calculating time lapse between browser loads
    localStorage.timeStamp = Date.now();
}

function retrievePetFromStorage() {
    pet = JSON.parse(localStorage.pet);
    var timeElapsed = Date.now() - localStorage.timeStamp;
    gameUpdate(timeElapsed);
}

/*

    GAME LOGIC

*/

// this function will be called on a set interval after
// the submit button has been clicked
// a defined time to decrease hunger is passed to the set interval function
function gameLoop() {
    gameUpdate(gameLoopFreq);
    displayPoop();
    displayHunger();
    petStatusText();
    saveToLocalStorage();
}

// all pet properties update here
function gameUpdate(timeElapsed) {
    hungerTimer += timeElapsed;
    var hungerLoss = Math.floor(hungerTimer / hungerDecreaseFreq);
    pet.hunger -= hungerLoss;
    hungerTimer -= hungerLoss * hungerDecreaseFreq;
    if (pet.hunger <= 0) {
        death();
    } else if (pet.hunger < sadHunger) {
        changeCondition("sad");
    }

    /// add in some conditions for sad pet (1 row of poop) and angry pet (multiple rows of poop)
    poopTimer += timeElapsed;
    var poopGain = Math.floor(poopTimer / poopFreq);
    if (pet.poop < maxPoop) {
        pet.poop += poopGain;
        if (pet.poop > angryPoop) {
            changeCondition("angry");
        } else if (pet.poop > sadPoop) {
            changeCondition("sad");
        }
    } else {
        pet.poop = maxPoop;
    }
    poopTimer -= poopGain * poopFreq;
}

// feed pet when food item clicked on
function feedPet() {
    var posOfFoodClicked = $(this).data("array-pos");
    var clickedFood = foods[posOfFoodClicked];
    if (pet.hunger < maxHunger) {
        pet.hunger += clickedFood.hungerIncrease;
        pet.experience += clickedFood.expGained;
        shortPurr();
        if (pet.hunger > sadHunger && pet.poop < sadPoop) {
            changeCondition("happy");
        }
        if (pet.hunger > maxHunger) {
            pet.hunger = maxHunger;
        }
        if (pet.poop < maxPoop) {
            // the foods that increase the hunger meter the most cause the most poop
            pet.poop += clickedFood.poopChange;
        }
    }
    displayUnlockedFood();
    displayHunger();
    displayPoop();
}

// clean up poop when clicked on
function removePoop() {
    $("this").remove();
    pet.poop -= 1;
    pet.experience += 20;
    displayPoop();
    if (pet.poop < sadPoop) {
        changeCondition("happy");
    }
}


// update image on pet condition change
function changeCondition(condition) {
    pet.condition = condition;
    $("#pet").attr("src", `images/pets/lion${pet.condition}.png`);
}

/*

      GAME PLAY DISPLAY

*/

function petStatusText() {
    var fullness = Math.round(pet.hunger / 100);
    $("#bottom-message").text(`Fullness: ${fullness}/10, Exp: ${pet.experience}, Condition: ${pet.condition}`);
}

// changes the hunger meter
function displayHunger() {
    $("#hunger-meter").attr("value", pet.hunger);
    petStatusText();
}


// toggles food menu when click on feed button
function foodMenuDisplay() {
    $(".food-menu").toggleClass("hidden");
    displayUnlockedFood();
}

// checked for which foods to unlock
function displayUnlockedFood() {
    for (var i = 0; i < foods.length; i++) {
        if (pet.experience >= foods[i].expToUnlock)
            $(`[data-array-pos="${i}"`).removeClass("hidden");
    }
}

// generates the poop
function displayPoop() {
    $(".poop-field").empty();
    for (var i = 1; i <= pet.poop; i++) {
        var poop = $("<img>").attr("src", "images/poop/poop.png");
        $(".poop-field").append(poop);
        poop.on("click", removePoop);
    }
    petStatusText();
}

// when feed pet, the pet purrs for just a short time
function shortPurr() {
    $("#pet").addClass("purr");
    setTimeout(function() { $("#pet").removeClass("purr"); }, 500);
}

// this is what happens when you kill your pet
function death() {
    $(".gameplay").addClass("hidden");
    $(".gameplay").fadeOut();
    $(".food-menu").addClass("hidden");
    $("#pet").addClass("death");
    $(".game-field").addClass("death-bg");
    $("#top-message").fadeOut();
    setTimeout(function() { $("#top-message").text("You have failed your pet...").fadeIn(); }, 500);
    $(".endgame").fadeIn();
    clearInterval(intervalID);
    changeCondition("dead");
}

/*

      ON PAGE LOAD, or GAME STATE CHANGE

*/

// icons from http://goodstuffnononsense.com/hand-drawn-icons/cooking-icons/
// generates foods from array  on page load- useful if i want to add more food to game
function foodMenuGenerate() {
    for (var i = 0; i < foods.length; i++) {
        var newImage = $("<img>").attr("src", `images/food/${foods[i].name}.png`);
        newImage.addClass("hidden"); // will unhide as exp matches unlock exp
        newImage.attr("data-array-pos", i);
        var newLi = $("<li>").html(newImage);
        $(".food-menu").append(newLi);
    }
}


// function for start game button (IF NEW USER OR ON RESET)
function initializeGame(e) {
    e.preventDefault();
    pet.name = $("#name-pet").val();
    if (pet.name === "") {
        $("#top-message").text("Please name your pet");
    } else {
        startGame();
    }
}

// this start game function loads after new pet has been named
// or user returning to established pet
function startGame() {
    displayGameStart(pet.name);
    intervalID = setInterval(gameLoop, gameLoopFreq);
    $("#hunger-meter").attr("max", `${maxHunger}`);
}

// once game is started by any method, this  arranges the display
function displayGameStart(name) {
    $("#top-message").text(`${name}, Your Little Pet`);
    $(".newgame").hide();
    $(".gameplay").fadeIn();
    $(".poop-field").empty();
    $(".poop-field").removeClass("hidden");
    $(".food-menu").addClass("hidden");
    changePetSize("70%");
    petStatusText();
}

function changePetSize(percent) {
    $("#pet").css("max-height", percent);
}

// restart after pet dies => brings back to new page screen
function resetGame() {
    pet = new Pet();
    changeCondition("happy");
    $("#pet").removeClass("death");
    $("h1").text("Your Little Pet");
    $(".endgame").fadeOut();
    $(".newgame").fadeIn();
    $(".game-field").removeClass("death-bg");
    $(".poop-field").addClass("hidden");
    changePetSize("100%");
}



$(function() {
    // check if viewer has seen page before
    var numViews = 0;
    // also checks if a pet has been saved, other wise it will try to retrive undefined and cause a crash!!!
    if (localStorage.viewCount && localStorage.pet) {
        retrievePetFromStorage();
        numViews = parseInt(localStorage.viewCount);
        startGame();
    }
    numViews += 1;
    localStorage.viewCount = numViews;

    foodMenuGenerate();

    // start game after get pet name
    $("form").on("submit", initializeGame);
    $("#feed-pet").on("click", foodMenuDisplay);
    $(".reset").on("click", resetGame);
    $(".food-menu img").on("click", feedPet);
});
