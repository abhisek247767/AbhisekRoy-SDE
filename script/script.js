/*==================== SHOW MENU ====================*/
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll(".nav_link");

function linkAction() {
  // No need to redeclare navMenu here, just use the globally declared one
  navMenu.classList.remove("show-menu");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*==================== SKILLS ====================*/
const skillsContent = document.getElementsByClassName("skills_content");
const skillsHeader = document.querySelectorAll(".skills_header");

function toggleSkills() {
  let itemClass = this.parentNode.className;

  for (let i = 0; i < skillsContent.length; i++) {
    skillsContent[i].className = "skills_content skills_close";
  }
  if (itemClass === "skills_content skills_close") {
    this.parentNode.className = "skills_content skills_open";
  }
}

skillsHeader.forEach((element) => {
  element.addEventListener("click", toggleSkills);
});

/*==================== QUALIFICATION ====================*/
const tabs = document.querySelectorAll("[data-target]");
const tabContents = document.querySelectorAll("[data-content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.target);

    // Remove active class from all tab contents
    tabContents.forEach((tabContent) => {
      tabContent.classList.remove("qualification_active");
    });

    // Add active class to the targeted content
    target.classList.add("qualification_active");

    // Remove active class from all tabs
    tabs.forEach((tab) => {
      tab.classList.remove("qualification_active");
    });

    // Add active class to the clicked tab
    tab.classList.add("qualification_active");
  });
});

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;
  // The last section may never reach the top, so highlight it at the page bottom
  const atBottom =
    window.innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
  const lastSection = sections[sections.length - 1];

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute("id");
    const isActive = atBottom
      ? current === lastSection
      : scrollY > sectionTop && scrollY <= sectionTop + sectionHeight;

    if (isActive) {
      document
        .querySelector(".nav_menu a[href*=" + sectionId + "]")
        .classList.add("active-link");
    } else {
      document
        .querySelector(".nav_menu a[href*=" + sectionId + "]")
        .classList.remove("active-link");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*==================== CHANGE BACKGROUND HEADER ====================*/
function scrollHeader() {
  const nav = document.getElementById("header");
  // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 80) nav.classList.add("scroll-header");
  else nav.classList.remove("scroll-header");
}
window.addEventListener("scroll", scrollHeader);

/*==================== SHOW SCROLL TOP ====================*/
function scrollUp() {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
  if (this.scrollY >= 560) scrollUp.classList.add("show-scroll");
  else scrollUp.classList.remove("show-scroll");
}
window.addEventListener("scroll", scrollUp);

const localTimeEl = document.getElementById("local-time");
const localTimeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function updateLocalTime() {
  const now = new Date();
  localTimeEl.textContent = localTimeFormat.format(now).toLowerCase();
  localTimeEl.dateTime = now.toISOString();
}

if (localTimeEl) {
  updateLocalTime();
  setInterval(updateLocalTime, 50000);
}

function initAnnotations() {
  if (!window.RoughNotation) return;
  const marks = document.querySelectorAll("[data-annotate]");
  if (!marks.length) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Resolve the theme red to rgb so the highlighter can use a see-through version
  const probe = document.createElement("span");
  probe.style.color = "var(--first-color)";
  document.body.appendChild(probe);
  const red = getComputedStyle(probe).color;
  probe.remove();
  const softRed = red.replace("rgb(", "rgba(").replace(")", ", 0.25)");

  const padding = { circle: 3, box: 3, highlight: 1, underline: 2 };
  const introMarks = [];
  const laterMarks = [];

  marks.forEach((el) => {
    const type = el.dataset.annotate;
    const color = type === "highlight" ? softRed : red;
    const annotation = RoughNotation.annotate(el, {
      type,
      color,
      padding: padding[type] || 2,
      strokeWidth: 1.5,
      multiline: true,
      animationDuration: 600,
      animate: !reduceMotion,
    });

    // Redraw the mark each time the mouse comes back over the phrase
    el.addEventListener("mouseenter", () => {
      annotation.hide();
      annotation.show();
    });

    // About cards turn red on hover, so draw the mark in white there
    const card = el.closest(".about_box");
    if (card) {
      card.addEventListener("mouseenter", () => (annotation.color = "#fff"));
      card.addEventListener("mouseleave", () => (annotation.color = color));
    }

    (el.closest(".home_description") ? introMarks : laterMarks).push({
      el,
      annotation,
    });
  });

  // Intro marks draw one after another, shortly after the page appears
  setTimeout(() => {
    RoughNotation.annotationGroup(introMarks.map((m) => m.annotation)).show();
  }, 800);

  // A drawn mark sits on top of the page, so it must be hidden while its text is
  // in a collapsed skills list, or it would stay floating where the text was
  const isCollapsed = (el) => !!el.closest(".skills_close");
  const isOnScreen = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };

  // Marks further down draw when they scroll into view, so they're seen animating.
  // Inside a slider, the slider itself is watched instead: its loop keeps duplicate
  // slides and swaps between them, so every copy is drawn as soon as the slider
  // appears; otherwise the mark would vanish and redraw on each loop.
  laterMarks.forEach((m) => (m.trigger = m.el.closest(".swiper") || m.el));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const isSlider = entry.target.classList.contains("swiper");
        if (entry.intersectionRatio < (isSlider ? 0.3 : 0.99)) return;
        laterMarks.forEach((m) => {
          if (m.trigger !== entry.target || isCollapsed(m.el)) return;
          if (!m.annotation.isShowing()) m.annotation.show();
        });
      });
    },
    { threshold: [0, 0.3, 1], rootMargin: "0px 0px -10% 0px" }
  );
  new Set(laterMarks.map((m) => m.trigger)).forEach((t) => observer.observe(t));

  // Opening one skills category closes the others: hide marks in closed lists
  // and redraw them when their list opens again
  document.querySelectorAll(".skills_content").forEach((category) => {
    new MutationObserver(() => {
      laterMarks.forEach((m) => {
        if (!category.contains(m.el)) return;
        if (isCollapsed(m.el)) {
          m.annotation.hide();
        } else if (isOnScreen(m.el)) {
          m.annotation.hide();
          m.annotation.show();
        }
      });
    }).observe(category, { attributes: true, attributeFilter: ["class"] });
  });

  // Content above a mark can change height (e.g. the recommendations slider resizes
  // per slide) and push the text down, but the drawn mark doesn't follow on its own.
  // When the page height changes, redraw (without animation) any mark whose text moved.
  const allMarks = introMarks.concat(laterMarks);
  const placeOf = (el) => {
    const r = el.getBoundingClientRect();
    return Math.round(r.top + window.scrollY) + "," + Math.round(r.left + window.scrollX);
  };
  allMarks.forEach((m) => (m.place = placeOf(m.el)));

  new ResizeObserver(() => {
    allMarks.forEach((m) => {
      const place = placeOf(m.el);
      if (place === m.place) return;
      m.place = place;
      if (!m.annotation.isShowing()) return;
      const animate = m.annotation.animate;
      m.annotation.animate = false;
      m.annotation.hide();
      m.annotation.show();
      m.annotation.animate = animate;
    });
  }).observe(document.body);
}

// Wait for fonts (not every image) so the marks are measured against the final text
document.fonts.ready.then(initAnnotations);

/*==================== DARK LIGHT THEME ====================*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "uil-sun";
const themeSound = new Audio("sounds/popUp.mp3");

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun";

// Tooltip on the wrapper names the mode the button switches to
function updateThemeTooltip() {
  themeButton.parentElement.dataset.tooltip =
    getCurrentTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](
    iconTheme
  );
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Play the pop sound from the start, even on rapid repeated clicks
  themeSound.currentTime = 0;
  themeSound.play().catch(() => {});
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
  updateThemeTooltip();
});
updateThemeTooltip();

const board = document.getElementById("board");
const cells = [];
let currentPlayer = "";
let playerSymbol = "X";
let computerSymbol = "O";
let gameActive = false;
let playerName = "";

function startGame() {
  gameActive = true;

  if (Math.random() < 0.5) {
    currentPlayer = "Your";
  } else {
    currentPlayer = "Abhisek's";
    setTimeout(computerMove, 300);
  }

  document.getElementById(
    "turn-info"
  ).textContent = `${currentPlayer} turn (you are "${playerSymbol}")`;

  cells.forEach((cell) => (cell.textContent = ""));
}

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cells.push(cell);
  board.appendChild(cell);

  cell.addEventListener("click", () => {
    if (cell.textContent === "" && currentPlayer === "Your" && gameActive) {
      cell.textContent = playerSymbol;
      if (checkWinner(playerSymbol)) {
        alert("Your");
        resetBoard();
      } else if (cells.every((cell) => cell.textContent !== "")) {
        alert("It's a draw!");
        resetBoard();
      } else {
        currentPlayer = "Abhisek's";
        document.getElementById(
          "turn-info"
        ).textContent = `${currentPlayer} turn`;
        setTimeout(computerMove, 500);
      }
    }
  });
}

function checkWinner(player) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winningCombinations.some((combination) =>
    combination.every((index) => cells[index].textContent === player)
  );
}

function computerMove() {
  if (!gameActive) return;

  const emptyCells = cells.filter((cell) => cell.textContent === "");
  if (emptyCells.length > 0) {
    const bestMove = findBestMove();
    cells[bestMove].textContent = computerSymbol;

    if (checkWinner(computerSymbol)) {
      alert("Abhisek Won");
      resetBoard();
    } else if (cells.every((cell) => cell.textContent !== "")) {
      alert("It's a draw!");
      resetBoard();
    }
  }
  currentPlayer = "Your";
  document.getElementById(
    "turn-info"
  ).textContent = `${currentPlayer} turn (you are "${playerSymbol}")`;
}

function resetBoard() {
  gameActive = false;

  cells.forEach((cell) => (cell.textContent = ""));
  currentPlayer = "Your";
  document.getElementById(
    "turn-info"
  ).textContent = `${currentPlayer} turn (you are "${playerSymbol}")`;
}

function minimax(board, depth, isMaximizing) {
  const scores = {
    X: -1,
    O: 1,
    draw: 0,
  };

  const result = checkWin(board);
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = computerSymbol;
        const score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = playerSymbol;
        const score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function findBestMove() {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (cells[i].textContent === "") {
      cells[i].textContent = computerSymbol;
      const score = minimax(
        cells.map((cell) => cell.textContent),
        0,
        false
      );
      cells[i].textContent = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function checkWin(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== "")) {
    return "draw";
  }

  return null;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("my-form");

  async function handleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("my-form-status");
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        status.innerHTML =
          "Thanks for your submission. I'll get back to you soon!";
        form.reset();
        setTimeout(() => {
          status.innerHTML = "";
        }, 10000);
      } else {
        const resData = await response.json();
        if (resData.errors) {
          status.innerHTML = resData.errors
            .map((error) => error.message)
            .join(", ");
        } else {
          status.innerHTML =
            "Oops! There was a problem submitting your form. Try again later.";
        }
      }
    } catch (error) {
      status.innerHTML =
        "Oops! There was a problem submitting your form. Try again later.";
      setTimeout(() => {
        status.innerHTML = "";
      }, 3000);
    }
  }

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

window.addEventListener('scroll', function() {
    const cmdPrompt = document.getElementById('cmd-prompt');
    if(this.scrollY >= 560) {
        cmdPrompt.classList.add('show-cmd');
    } else {
        cmdPrompt.classList.remove('show-cmd');
    }
});