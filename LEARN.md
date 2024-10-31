This script automates word-typing for the "Spell Bee" game by first fetching a list of valid English words, then filtering this list based on the game's letter constraints, and finally typing each valid word directly into the game interface.

### Simulating Typing
To simulate typing, the script uses the `simulateKeyPress` and `typeWord` functions, which emulate the keyboard events that occur when a user physically types on their keyboard. If this script does not work on a website, it means that the website checks the origin of the keyboard element. In which you will have to run a script to detect which element has on key up, key down, and key press listeners.

- **`simulateKeyPress(char)`**: This function creates and dispatches synthetic `keydown`, `keypress`, and `keyup` events for a given character. By setting properties like `key`, `code`, `keyCode`, and `which`, it mimics the behavior of real key presses. Each of these events is then dispatched on the document, making the game interpret the action as if the character were typed by a human.

- **`typeWord(word)`**: This function takes a word and calls `simulateKeyPress` for each character, creating a slight delay between each press. After typing all characters, it dispatches an "Enter" key event to submit the word. This process allows for automated entry of the word as if it were manually typed.

### Filtering Words with Regex

The script uses regular expressions to filter words based on the game rules. Specifically, it requires each word to include a "mandatory" central letter and allows only a set of specific letters.

- **`generateRegex(mandatory, allLetters)`**: This function constructs a regex pattern based on the mandatory letter and an array of allowed letters. Using the `^[${allowedLetters}]*${mandatory}[${allowedLetters}]*$` pattern, it ensures that:
  - Each word starts and ends with any of the allowed letters.
  - The mandatory letter appears at least once somewhere in the word.

- **`isValidWord(word, mandatory, allLetters)`**: By using the regex pattern created in `generateRegex`, this function checks whether a word meets the game's constraints. It tests that the word contains at least one occurrence of the mandatory letter and only contains allowed letters.

