// Runs in <head> before paint to avoid a theme flash.
(function () {
  try {
    var saved = localStorage.getItem("rgg-theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
