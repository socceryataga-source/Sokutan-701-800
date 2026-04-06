const state = {
  mode: "order",
  source: [],
  currentIndex: 0,
  score: 0,
  answers: [],
  lastStart: 701,
  lastEnd: 800
};

const menuView = document.getElementById("menuView");
const quizView = document.getElementById("quizView");
const resultView = document.getElementById("resultView");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const wordText = document.getElementById("wordText");
const choicesBox = document.getElementById("choicesBox");
const feedbackBox = document.getElementById("feedbackBox");
const finalScoreText = document.getElementById("finalScoreText");

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
  });
});

document.getElementById("startBtn").addEventListener("click", startQuiz);
document.getElementById("prevBtn").addEventListener("click", goPrev);
document.getElementById("nextBtn").addEventListener("click", goNext);
document.getElementById("restartBtn").addEventListener("click", restartSameCondition);
document.getElementById("restartFromResultBtn").addEventListener("click", restartSameCondition);
document.getElementById("resetRangeBtn").addEventListener("click", backToMenu);
document.getElementById("backMenuBtn").addEventListener("click", backToMenu);
document.getElementById("backMenuFromResultBtn").addEventListener("click", backToMenu);
document.getElementById("speakBtn").addEventListener("click", speakWord);

function startQuiz() {
  const start = Number(startInput.value);
  const end = Number(endInput.value);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
    alert("開始番号と終了番号を正しく入力してください。");
    return;
  }
  const filtered = data.filter(item => item.id >= start && item.id <= end);
  if (!filtered.length) {
    alert("その範囲にはデータがありません。");
    return;
  }

  state.lastStart = start;
  state.lastEnd = end;
  state.source = [...filtered];
  if (state.mode === "random") {
    shuffle(state.source);
  } else {
    state.source.sort((a, b) => a.id - b.id);
  }
  state.currentIndex = 0;
  state.score = 0;
  state.answers = Array(state.source.length).fill(null);

  menuView.classList.add("hidden");
  resultView.classList.add("hidden");
  quizView.classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  const item = state.source[state.currentIndex];
  const answerState = state.answers[state.currentIndex];

  progressText.textContent = `${state.currentIndex + 1} / ${state.source.length}`;
  scoreText.textContent = `得点 ${state.score}`;
  wordText.textContent = item.word;
  choicesBox.innerHTML = "";
  feedbackBox.className = "feedback";
  feedbackBox.innerHTML = "選択肢を選ぶと、正誤と例文が表示されます。";

  item.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = `${index + 1}. ${choice}`;
    btn.disabled = answerState !== null;
    btn.addEventListener("click", () => answer(index));
    choicesBox.appendChild(btn);
  });

  if (answerState !== null) {
    paintAnsweredState(item, answerState.selectedIndex);
    showFeedback(item, answerState.selectedIndex === item.correct);
  }
}

function answer(selectedIndex) {
  const item = state.source[state.currentIndex];
  if (state.answers[state.currentIndex] !== null) return;

  const isCorrect = selectedIndex === item.correct;
  state.answers[state.currentIndex] = { selectedIndex, isCorrect };
  if (isCorrect) state.score += 1;

  scoreText.textContent = `得点 ${state.score}`;
  paintAnsweredState(item, selectedIndex);
  showFeedback(item, isCorrect);
}

function paintAnsweredState(item, selectedIndex) {
  const buttons = [...document.querySelectorAll(".choice-btn")];
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === item.correct) btn.classList.add("correct");
    if (idx === selectedIndex && idx !== item.correct) btn.classList.add("wrong");
  });
}

function showFeedback(item, isCorrect) {
  feedbackBox.className = `feedback ${isCorrect ? "ok" : "ng"}`;
  feedbackBox.innerHTML = `
    <strong>${isCorrect ? "⭕ 正解" : "❌ 不正解"}</strong><br>
    正解：${item.choices[item.correct]}<br><br>
    <strong>例文</strong>：${item.sentence}<br>
    <strong>和訳</strong>：${item.jp}
  `;
}

function goPrev() {
  if (state.currentIndex === 0) return;
  state.currentIndex -= 1;
  renderQuestion();
}

function goNext() {
  if (state.currentIndex < state.source.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
    return;
  }
  showResult();
}

function showResult() {
  quizView.classList.add("hidden");
  resultView.classList.remove("hidden");
  finalScoreText.textContent = `${state.source.length}問中 ${state.score}問正解`;
}

function restartSameCondition() {
  startInput.value = state.lastStart;
  endInput.value = state.lastEnd;
  startQuiz();
}

function backToMenu() {
  quizView.classList.add("hidden");
  resultView.classList.add("hidden");
  menuView.classList.remove("hidden");
}

function speakWord() {
  const item = state.source[state.currentIndex];
  if (!item) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(item.word);
  utter.lang = "en-US";
  utter.rate = 0.95;
  speechSynthesis.speak(utter);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
