/**
 * Runs before the app bundle so the page paints in the right theme straight
 * away. Kept as a separate file rather than inline so the Content Security
 * Policy can forbid inline scripts.
 */
(function () {
  var DARK = ["dark", "slate", "forest"];
  var theme = "system";

  try {
    var saved = JSON.parse(localStorage.getItem("type-sensei:settings:v1") || "null");
    if (saved && typeof saved.theme === "string") theme = saved.theme;
  } catch (error) {
    // Storage can be unavailable; the default is used instead.
  }

  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  document.documentElement.dataset.theme = theme;
  if (DARK.indexOf(theme) !== -1) document.documentElement.classList.add("dark");
})();
