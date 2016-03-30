/**
 * Created by ekeu on 23/03/16.
 */
var isVowel = function(char){
    var vowels = "aeiou";
    return vowels.indexOf(char.toLowerCase()) !== -1;
};

var removeVowels = function(word){
    var result = "";
    var index;
    for (index = 0; index < word.length; index++) {
        if (!isVowel(word[index])) {
            result += word[index];
        }
    }
    return result;
};

var removeVowelsFromEach = function(list){
    var result = [];
    for (var i = 0; i < list.length; i++){
        result.push(removeVowels(list[i]));
    }
    return result;
};
