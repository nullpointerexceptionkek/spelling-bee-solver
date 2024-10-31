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

    document.body.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
    document.body.dispatchEvent(new KeyboardEvent("keypress", eventOptions));
    document.body.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
  }

  async function typeWord(word, keypressDelay, submissionDelay) {
    for (let char of word) {
      simulateKeyPress(char);
      await new Promise((resolve) => setTimeout(resolve, keypressDelay));
    }

    const enterEventOptions = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
    };
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", enterEventOptions)
    );
    document.body.dispatchEvent(
      new KeyboardEvent("keypress", enterEventOptions)
    );
    document.body.dispatchEvent(new KeyboardEvent("keyup", enterEventOptions));

    await new Promise((resolve) => setTimeout(resolve, submissionDelay));
  }

  function detectLetters() {
    let mode = "slow";
    // Spellsbee.com Format
    const letterButtons = document.querySelectorAll(".keys-button.hex");
    const middleButton = document.querySelector(".keys-button.middle.hex");

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
      mode = "fast";
      return { letters: letters.join(" "), mode };
    }
    // NYT Format
    const centerCell = document.querySelector(".hive-cell.center .cell-letter");
    const outerCells = document.querySelectorAll(
      ".hive-cell.outer .cell-letter"
    );
    if (centerCell && outerCells.length === 6) {
      let middleLetter = centerCell.textContent.toLowerCase();
      let letters = Array.from(outerCells).map((cell) =>
        cell.textContent.toLowerCase()
      );
      letters.unshift(middleLetter);
      console.log(`Detected letters (Method 2): ${letters.join(" ")}`);
      mode = "fast";
      return { letters: letters.join(" "), mode };
    }
    // Spellsbee.org format
    const hexGrid = document.querySelectorAll("#hexGrid .hex p");
    const centerLetterElement = document.querySelector("#center-letter p");
    if (hexGrid.length === 7 && centerLetterElement) {
      const letters = Array.from(hexGrid).map((cell) =>
        cell.textContent.toLowerCase()
      );
      const middleLetter = centerLetterElement.textContent.toLowerCase();
      if (letters.includes(middleLetter)) {
        letters.splice(letters.indexOf(middleLetter), 1);
      }
      letters.unshift(middleLetter);
      console.log(`Detected letters: ${letters.join(" ")}`);
      return { letters: letters.join(" "), mode };
    }

    // general format
    const middleLetterElement = document.querySelector(".hex.middle");
    const outerLetterElements = document.querySelectorAll(".hex:not(.middle)");

    if (middleLetterElement && outerLetterElements.length === 6) {
      const middleLetter = middleLetterElement.textContent.toLowerCase();
      const letters = Array.from(outerLetterElements).map((el) =>
        el.textContent.toLowerCase()
      );
      letters.unshift(middleLetter);
      console.log(`Detected letters (General Format): ${letters.join(" ")}`);
      return { letters: letters.join(" "), mode };
    }

    const userInput = window.prompt(
      "Unable to detect letters. Please enter the 7 letters (first one is the center letter), separated by spaces:",
      ""
    );
    if (userInput) {
      return { letters: userInput, mode };
    } else {
      console.error("No letters provided.");
      return null;
    }
  }

  async function filterAndTypeWords() {
    const detectionResult = detectLetters();
    if (!detectionResult) return;

    const { letters, mode } = detectionResult;
    console.log(`Using ${mode} mode`);

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

    let keypressDelay, submissionDelay;
    if (mode === "fast") {
      keypressDelay = 10;
      submissionDelay = 100;
    } else {
      keypressDelay = 30;
      submissionDelay = 2300;
    }

    for (let word of filteredWords) {
      console.log(`Typing word: ${word}`);
      await typeWord(word, keypressDelay, submissionDelay);
    }
  }

  await filterAndTypeWords();
})();
