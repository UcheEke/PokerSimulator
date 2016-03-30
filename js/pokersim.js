/**
 * Created by ekeu on 29/03/16.
 */

// Globals:

var deck = []; // Array of 52 cards with Aces low
var suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
var ranks = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
var fullDeck; // Permanent copy of initially generated deck
var handData = {};
var userData = {};
var maintitle;
var numSims = 0;

// Basics: Deck generation and shuffle functions, and a function that creates a poker hand if
// possible
var generateDeck = function(){
    // Generates the full deck of cards from the global
    // arrays 'suits' and 'ranks'. A copy "full deck" is used
    // to replace the 'deck' if it gets depleted to save
    // reproducing it multiple times
    deck = []; // Initialise the global deck

    var currentCard = {};
    suits.forEach(function(suit){
        ranks.forEach(function(rank){
            currentCard.suit = suit;
            currentCard.rank = rank;
            deck.push(currentCard);
            currentCard = {};
        });
    });
    fullDeck = deck; // Store a copy of the completed deck for later use
};

var shuffleDeck = function () {
    // Shuffles the current deck of cards
    // using the Knuth-Fisher-Yates shuffle algorithm
    var swap = function (a, b) {
        var c = deck[a];
        deck[a] = deck[b];
        deck[b] = c;
    };
    var L = deck.length;
    for (var i = 0; i < L; i++) {
        swap(i, (i + Math.floor(Math.random() * (L-i))));
    }
};

var generateHand = function(){
    // Generates a hand of 5 cards from the current deck
    // depleting the deck by 5 once complete
    if (deck.length >= 5) {
        var result = deck.slice(0,5);
        deck = deck.slice(5,deck.length);
        return result;
    } else {
        // At this point we can regenerate the deck if necessary
        // (deck = fulldeck)
        console.log("Not enough cards to generate poker hand");
    }
};

var isCard = function(obj){
    // Returns true if obj is a valid card object, false otherwise
    return typeof(obj.rank) === "string" && typeof (obj.suit) === "string";
};

// Comparison function for sorting hands
var compare = function(card1, card2) {
    if (isCard(card1) && isCard(card2)){
        if (ranks.indexOf(card1.rank) > ranks.indexOf(card2.rank)) {
            return 1;
        } else if (ranks.indexOf(card1.rank) === ranks.indexOf(card2.rank) &&
        suits.indexOf(card1.suit) > suits.indexOf(card2.suit)) {
            return 1;
        } else {
            return -1;
        }
    }
};

// Print outs and displays

// DEBUG Function
var printFrequencies = function(sampleSize){
  Object.keys(handData).forEach(function (key) {
      var rawdata = handData[key].freq;
      var perc = Math.floor(rawdata * 10000 * 100/ sampleSize) / 10000.0;
      console.log(handData[key].name + ": " + rawdata + " (" + perc +"%)");
  });
};

// DEBUG Function
var printHand = function(list){
    // Prints all cards in list to the console
    list.forEach(function(card){
        if (isCard(card)) {
            console.log(card.rank + " of " + card.suit);
        }
    });
    console.log("");
};

var displayFrequencies = function(sampleSize){
    numSims++;
    var tableDiv = document.getElementById("freqTable");

    var title = document.createElement('h2');
    title.innerHTML = "Results: ";
    tableDiv.appendChild(title);

    var headerData = ["Hand", "# of occurrences", "% Probability (Avg. over "+ numSims + " runs)"];
    var table = document.createElement("table");
    table.classList.add("table", "table-hover", "table-condensed");
    // Add Caption
    var caption = document.createElement("caption");
    caption.classList.add("info");
    caption.innerHTML = "After dealing " + sampleSize + " hands";
    table.appendChild(caption);

    var th, tr, td;
    // Add Headers
    var thead = document.createElement('thead');
    tr = document.createElement('tr');
    headerData.forEach(function (header){
        th = document.createElement('th');
        th.innerHTML = header;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    // Add data
    var tbody = document.createElement('tbody');

    Object.keys(handData).forEach(function(key){
        tr = document.createElement('tr');
        td = document.createElement('td');
        td.innerHTML = handData[key].name;
        tr.appendChild(td);

        var rawdata = handData[key].freq;
        td = document.createElement('td');
        td.innerHTML = rawdata;
        tr.appendChild(td);

        var epsilon = 0.00001;
        var perc = (rawdata * 100.0 / sampleSize);
        var hperc = handData[key].hfreq;
        if (hperc > epsilon ){
            hperc = (perc + (numSims - 1)*hperc) / numSims;
        } else {
            hperc = perc;
        }
        handData[key].hfreq = hperc;

        td = document.createElement('td');
        td.innerHTML = perc.toFixed(4) + " (" + hperc.toFixed(4) + ")";
        tr.appendChild(td);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    // Create table in document
    tableDiv.appendChild(table);
};

var displayHand = function(hand, classification, mtitle){
    // Displays the current hand to the browser
    // Not currently working properly

    var title;
    var description;

    if (classification){
        title = handData[classification].name;
        description = handData[classification].description;
    } else {
        title = "Low Value Hand";
        description = "Unclassified";
    }

    var base_offset = 2; // px
    var rank_size = 90;  // px
    var cards = document.getElementById("cards");

    if (mtitle){
        var h2 = document.createElement('h2');
        h2.innerHTML = "Example of chosen hands featured in the current run: ";
        cards.appendChild(h2);
    }

    var container = document.createElement("div");
    var header = document.createElement("h3");
    header.innerHTML = title;
    var detail = document.createElement("p");
    detail.innerHTML = description;
    container.appendChild(header);
    container.appendChild(detail);
    var currentHand = document.createElement("div");
    currentHand.classList.add("hand");
    hand.forEach(function(card){
        var currentCard = document.createElement("div");
        currentCard.classList.add("card");
        currentCard.classList.add(card.suit);
        var bposx = base_offset + ranks.indexOf(card.rank)*rank_size + "px ";
        currentCard.setAttribute("style", "background-position: -" + bposx);
        currentHand.appendChild(currentCard);
    });
    container.appendChild(currentHand);
    cards.appendChild(container);
};

/*
 Hand Evaluators

 Poker hands in ascending order:
  1. High Card: The highest card within the hand determines the hand's value
  2. Pair: Two cards of the same rank within the hand
  3. Two Pair: Two pairs of equal rank cards
  4. Three of a Kind: Three cards of equal rank
  5. Straight: Five cards of any suit that form a sequence
  6. Flush: All cards are of the same suit but may not form a sequence
  7. Full House: Three of a Kind and a Pair within a hand
  8. Four of a Kind: Four cards of the same suit
  9. Straight Flush: A Straight in the same suit
 10. Royal Flush: A Straight Flush in the range of 9-K (aces low) or 10-A (aces high)

 */

var isHand = function(hand){
    // Validates whether passed obj is a poker hand
    return hand.filter(function(card){
        return isCard(card)
    }).length === 5;
};

var nOfAKind = function(hand, n){
    // Returns an array with sub arrays of groups of cards with rank=n
    if (!isHand(hand)){
        return false;
    }
    var result = [];
    hand.forEach(function(card){
        var subgroup = hand.slice(hand.indexOf(card), hand.length).filter(function(element){
            return element.rank === card.rank;
        });
        if (subgroup.length === n){
            result.push(subgroup);
        }
    });
    return result;
};

var isStraight = function(hand){
    return hand.every(function(card){
        return hand.every(function(element){
            return Math.abs(ranks.indexOf(card.rank) - ranks.indexOf(element.rank)) <= 4
        });
    })
};

var isRoyal = function(hand){
    return hand.every(function(card){
        var cardRank = ranks.indexOf(card.rank);
        return cardRank <= ranks.indexOf("Ace") && cardRank >= ranks.indexOf("Ten");
    });
};

var isFlush = function(obj){
    return obj.every(function(card){
       return isCard(card) && card.suit === obj[0].suit;
    });
};

var init = function(){
    var dataDetail = function(name,description){
        return {
            name : name,
            description: description,
            freq : 0,
            hfreq: 0,
            display : false,
            displaycount : 1
        };
    };

    handData["royalflush"] = new dataDetail(
        "Royal Flush",
        "A sequence of cards of the same suit ranging from 10-A"
    );
    handData["straightflush"] = new dataDetail(
        "Straight Flush",
        "A sequence of cards of the same suit with highest ranked card lower than an A"
    );
    handData["fourofakind"] =new dataDetail(
        "Four of a Kind",
        "Hand contains four cards of equal rank"
    );
    handData["fullhouse"] = new dataDetail(
        "Full House",
        "Three of a Kind and a Pair"
    );
    handData["flush"] = new dataDetail(
        "Flush",
        "A non sequenced selection of cards from the same suit"
    );
    handData["straight"] = new dataDetail(
        "Straight",
        "A sequence of cards of mixed suits"
    );
    handData["threeofakind"] = new dataDetail(
        "Three of a Kind",
        "Hand contains three cards of the same rank"
    );
    handData["twopair"] = new dataDetail(
        "Two Pair",
        "Hand contains two pairs of cards of equal rank"
    );
    handData["pair"] = new dataDetail(
        "Pair",
        "Hand contains a single pair of cards of equal rank"
    );
    handData["highcard"] = new dataDetail(
        "High Card",
        "Highest card determines the value. Most common and weakest of hands"
    );

    maintitle = true;
};

var resetScores = function(){
  Object.keys(handData).forEach(function(key){
      handData[key].freq = 0;
      handData[key].displaycount = 1;
  });

    maintitle = true;
};

var classifyHand = function(hand){
    var cls;

    if (!isHand(hand)){
        console.log("Invalid object provided");
    } else if (isStraight(hand) && isFlush(hand) && isRoyal(hand)){
        cls = "royalflush";
    } else if (isStraight(hand) && isFlush(hand)){
        cls = "straightflush";
    } else if (nOfAKind(hand, 4).length > 0){
        cls = "fourofakind";
    } else if (nOfAKind(hand, 3).length > 0 && nOfAKind(hand, 2).length >= 2){
        cls = "fullhouse";
    } else if (isFlush(hand)){
        cls = "flush";
    } else if (isStraight(hand) && nOfAKind(hand,1).length === 5){
        cls = "straight";
    } else if (nOfAKind(hand, 3).length > 0){
        cls = "threeofakind";
    } else if (nOfAKind(hand,2).length == 2){
        cls = "twopair";
    } else if (nOfAKind(hand,2).length == 1){
        cls = "pair";
    } else {
        cls = "highcard";
    }

    handData[cls].freq += 1;

    if (handData[cls].display && handData[cls].displaycount > 0){
        console.log("Hand: %s\n", handData[cls].name);
        displayHand(hand, cls, maintitle);
        handData[cls].displaycount--;
    }
    if (maintitle){
        maintitle = false;
    }
};

var pokerSimulation = function(){
    console.log("Starting Simulation...");
    generateDeck();
    shuffleDeck();
    var numHands = 0;
    while(numHands < userData.maxHands ){
        if (deck.length <= 2) {
            deck = fullDeck;
            shuffleDeck();
        }
        while (deck.length > 2) {
            var hand = generateHand();
            hand.sort(compare);
            classifyHand(hand);
            numHands++;
        }
    }

    displayFrequencies(numHands);
};



document.addEventListener("DOMContentLoaded", function(){
    init();
    var numHands = document.getElementById("numHands");
    var btnRunSim = document.getElementById("btnRunSim");

    var getUserData = function(){
        if (numHands.value !== ""){
            userData.maxHands = parseInt(numHands.value);
        } else {
            userData.maxHands = 50;
        }

        var chkRoyal = document.getElementById('chkRoyal');
        var chkSFlush = document.getElementById('chkSFlush');
        var chkFour = document.getElementById('chkFour');
        var chkFHouse = document.getElementById('chkFHouse');
        var chkFlush = document.getElementById('chkFlush');
        var chkStr = document.getElementById('chkStr');
        var chk3 = document.getElementById('chk3');
        var chk2Pair = document.getElementById('chk2Pair');
        var chkPair = document.getElementById('chkPair');
        var chkHigh = document.getElementById('chkHigh');

        if (chkRoyal.checked){handData.royalflush.display = true;}
        if (chkSFlush.checked){handData.straightflush.display = true;}
        if (chkFour.checked){handData.fourofakind.display = true;}
        if (chkFHouse.checked){handData.fullhouse.display = true;}
        if (chkFlush.checked){handData.flush.display = true;}
        if (chkStr.checked){handData.straight.display = true;}
        if (chk3.checked){handData.threeofakind.display = true;}
        if (chk2Pair.checked){handData.twopair.display = true;}
        if (chkPair.checked){handData.pair.display = true;}
        if (chkHigh.checked){handData.highcard.display = true;}

    };

    var resetPage = function(){
        var cards = document.getElementById('cards');
        var freqTable = document.getElementById('freqTable');

        while(cards.firstChild){
            cards.removeChild(cards.firstChild);
        }

        while(freqTable.firstChild){
            freqTable.removeChild(freqTable.firstChild);
        }
    };
    
    btnRunSim.addEventListener('click', function(){
        resetScores();
        getUserData();
        resetPage();
    });
});




