"use strict";

// v0.1.0：只提供首頁與遊戲設定介面。題庫、計時、正式開始遊戲留待後續版本。
const homeView = document.querySelector("#home-view");
const setupView = document.querySelector("#setup-view");
const startButton = document.querySelector("#start-btn");
const backButton = document.querySelector("#back-btn");
const brandLink = document.querySelector("#brand-link");
const setupForm = document.querySelector("#setup-form");
const nicknameInput = document.querySelector("#nickname");
const formMessage = document.querySelector("#form-message");
const currentYear = document.querySelector("#current-year");

currentYear.textContent = new Date().getFullYear();

function showView(view) {
  const showingSetup = view === "setup";
  homeView.hidden = showingSetup;
  setupView.hidden = !showingSetup;
  homeView.classList.toggle("view--active", !showingSetup);
  setupView.classList.toggle("view--active", showingSetup);
  if (!showingSetup) formMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "instant" });
  if (showingSetup) document.querySelector("#setup-title").focus?.();
}

startButton.addEventListener("click", () => {
  showView("setup");
  nicknameInput.focus();
});
backButton.addEventListener("click", () => showView("home"));
brandLink.addEventListener("click", (event) => {
  if (!setupView.hidden) {
    event.preventDefault();
    showView("home");
  }
});

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    formMessage.textContent = "請先輸入玩家暱稱。";
    nicknameInput.focus();
    return;
  }
  const category = document.querySelector("#category");
  const difficulty = document.querySelector("#difficulty");
  const categoryLabel = category.selectedOptions[0].textContent;
  const difficultyLabel = difficulty.selectedOptions[0].textContent;
  formMessage.textContent = `設定完成：${nickname}｜${categoryLabel}｜${difficultyLabel}。正式答題功能將於後續版本加入。`;
});
