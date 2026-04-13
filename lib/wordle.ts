export function evaluateGuess(guess: string, answer: string) {
  const result = Array(guess.length).fill("gray");
  const answerChars = answer.split("");

  // greens
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "green";
      answerChars[i] = null as any;
    }
  }

  // yellows
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "gray" && answerChars.includes(guess[i])) {
      result[i] = "yellow";
      answerChars[answerChars.indexOf(guess[i])] = null as any;
    }
  }

  return result;
}
