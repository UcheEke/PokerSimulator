/**
 * Created by ekeu on 25/03/16.
 */
// Remember there is no ordering within an object. In order to shuffle the deck,
// the deck must be sortable

var deck = [];
var suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
var ranks = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
var fullDeck;

// Utilities

var isCard = function(obj){
    return typeof(obj.rank) === "string" && typeof (obj.suit) === "string";
};

var isCardGreaterThan = function(card1, card2) {
    if (isCard(card1) && isCard(card2)){
        if (ranks.indexOf(card1.rank) > ranks.indexOf(card2.rank)) {
            return true;
        } else {
            return (ranks.indexOf(card1.rank) === ranks.indexOf(card2.rank) &&
            suits.indexOf(card1.suit) > suits.indexOf(card2.suit));
        }
    }
    return false;
};

var printCards = function(list){
  list.forEach(function(card){
      if (isCard(card)) {
          console.log(card.rank + " of " + card.suit);
      }
  });
    console.log("");
};

var printHand = function(hand){
    var suit_size = 112; // px
    var rank_size = 90;  // px
    var cards = document.getElementById("cards");
    var currentHand = document.createElement("div");
    currentHand.classList.add("hand");
    hand.forEach(function(card){
        var currentCard = document.createElement("div");
        currentCard.classList.add("card");
        var bposx = ranks.indexOf(card.rank)*rank_size - 9 + "px ";
        var bposy = suits.indexOf(card.suit)*suit_size - 1 + "px ";
        currentCard.setAttribute("style", "background-position: " + bposx + bposy);
        currentHand.appendChild(currentCard);
        console.log("Position:",bposx, bposy);
    });
    cards.appendChild(currentHand);
};

var printSubs = function(subhands){
    var count = 0;
    subhands.forEach(function(subhand){
        count++;
        console.log("subhand #%s\n",count);
        printHand(subhand);
    });
};

var generateDeck = function(){
    var currentCard = {};
    suits.forEach(function(suit){
        ranks.forEach(function(rank){
            currentCard.suit = suit;
            currentCard.rank = rank;
            deck.push(currentCard);
            currentCard = {};
        });
    });
    fullDeck = deck;
};

var shuffleDeck = function () {
    // Using the Knuth-Fisher-Yates shuffle algorithm
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
    if (deck.length >= 5) {
        var result = deck.slice(0,5);
        deck = deck.slice(5,deck.length);
        return result;
    } else {
        console.log("Not enough cards to generate hand");
    }
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
    var result = hand.filter(function(card){
        return isCard(card)
    });
    return result.length === 5;
};

// To determine pairs, three of a kind and full houses
var nOfAKind = function(hand, n){
    // Returns an array with any groupings of cards by rank found
    if (!isHand(hand)){
        return false;
    }
    var result = [];
    var i,j;
    for (i=0;i<5;i++){
        var count = [];
        count.push(hand[i]);
        for (j=i+1; j<5; j++){
            if (hand[i].rank === hand[j].rank){
                count.push(hand[j]);
                if (count.length === n){
                    result.push(count);
                }
            }
        }
    }
    return result;
};

var isStraight = function(hand){
    return hand.every(function(card){
        return Math.abs(ranks.indexOf(card.rank) - ranks.indexOf(hand[0].rank)) <= 4 ;
    })
};

var isRoyal = function(hand){
    return hand.some(function(card){
        var cardRank = ranks.indexOf(card.rank);
        return cardRank <= ranks.indexOf("Ace") && cardRank >= ranks.indexOf("Ten");
    });
};

var containsFlush = function(hand){
    // type
    if (hand.every(function(card){
            return card.suit === hand[0].suit;
    })){
        // Type of flush
        if (isStraight(hand) && isRoyal(hand)){
            console.log("Royal flush");
        } else if (isStraight(hand)){
            console.log("Straight Flush");
        }
        return true;
    }
    return false;
};


// Pseudo-main...
var pokerSimulator = function(){
    generateDeck();
    shuffleDeck();
    while (deck.length > 2) {
        var hand = generateHand();
        for (var num = 2; num < 5; num++){
            var subhands = nOfAKind(hand,num);
            if (subhands.length > 0) {
                printHand(hand);
                printSubs(subhands);
            }
        }
    }
};

