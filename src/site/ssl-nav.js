(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#ssl-global-nav");
  if (!toggle || !nav) return;
  var mobileQuery = window.matchMedia("(max-width: 720px)");

  function syncNavState() {
    if (mobileQuery.matches) {
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    } else {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }
  }

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.hidden = isOpen;
  });

  mobileQuery.addEventListener("change", syncNavState);
  syncNavState();
})();
