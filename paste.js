//MIT License Copyright Louis Li 2024
//Paste the following code in browser console
(async () => {
  async function fetchWordList() {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/words/an-array-of-english-words/refs/heads/master/index.json"
      );
      if (!response.ok) {
        console.error("Failed to fetch word list:", response.statusText);
        return [];
      }
      const words = await response.json();
      return words;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  function generateRegex(mandatory, allLetters) {
    const allowedLetters = allLetters.join("");
    return new RegExp(
      `^[${allowedLetters}]*${mandatory}[${allowedLetters}]*$`,
      "i"
    );
  }

  function isValidWord(word, mandatory, allLetters) {
    const regex = generateRegex(mandatory, allLetters);
    const mandatoryCount = word
      .split("")
      .filter((char) => char === mandatory).length;
    return regex.test(word) && mandatoryCount >= 1;
  }

  function simulateKeyPress(char) {
    const eventOptions = {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: char.toUpperCase().charCodeAt(0),
      which: char.toUpperCase().charCodeAt(0),
      bubbles: true,
      cancelable: true,
    };

    document.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
    document.dispatchEvent(new KeyboardEvent("keypress", eventOptions));
    document.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
  }

  async function typeWord(word) {
    for (let char of word) {
      simulateKeyPress(char);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const enterEventOptions = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    };
    document.dispatchEvent(new KeyboardEvent("keydown", enterEventOptions));
    document.dispatchEvent(new KeyboardEvent("keypress", enterEventOptions));
    document.dispatchEvent(new KeyboardEvent("keyup", enterEventOptions));

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  function detectLetters() {
    // Spellsbee.com Format
    let letterButtons = document.querySelectorAll(".keys-button.hex");
    let middleButton = document.querySelector(".keys-button.middle.hex");

    if (letterButtons.length === 7 && middleButton) {
      let letters = Array.from(letterButtons).map((button) =>
        button.textContent.toLowerCase()
      );
      let middleLetter = middleButton.textContent.toLowerCase();

      if (letters.includes(middleLetter)) {
        letters.splice(letters.indexOf(middleLetter), 1);
      }
      letters.unshift(middleLetter);
      console.log(`Detected letters (Method 1): ${letters.join(" ")}`);
      return letters.join(" ");
    }

    // NYT Format
    let centerCell = document.querySelector(".hive-cell.center .cell-letter");
    let outerCells = document.querySelectorAll(".hive-cell.outer .cell-letter");

    if (centerCell && outerCells.length === 6) {
      let middleLetter = centerCell.textContent.toLowerCase();
      let letters = Array.from(outerCells).map((cell) =>
        cell.textContent.toLowerCase()
      );
      letters.unshift(middleLetter);
      console.log(`Detected letters (Method 2): ${letters.join(" ")}`);
      return letters.join(" ");
    }

    const userInput = window.prompt(
      "Unable to detect letters. Please enter the 7 letters (first one is the center letter), separated by spaces:",
      ""
    );
    if (userInput) {
      return userInput;
    } else {
      console.error("No letters provided.");
      return null;
    }
  }

  async function filterAndTypeWords() {
    const letters = detectLetters();
    if (!letters) return;
    const wordList = await fetchWordList();
    if (wordList.length === 0) {
      console.error("Failed to load word list.");
      return;
    }
    let [mandatory, ...otherLetters] = letters.split(" ");
    let allLetters = [mandatory, ...otherLetters];
    const filteredWords = wordList.filter(
      (word) => word.length >= 4 && isValidWord(word, mandatory, allLetters)
    );
    console.log(`Found ${filteredWords.length} matching words:`);
    console.log(filteredWords);
    for (let word of filteredWords) {
      console.log(`Typing word: ${word}`);
      await typeWord(word);
    }
  }

  await filterAndTypeWords();
})();
