window.$ = window.jQuery = require("jquery");
moment = require("moment");

// url
const categoriesUrl =
  "https://fairshake.com.au/trivia-game/administrator/api/category/read.php";
const questionUrl =
  "https://fairshake.com.au/trivia-game/administrator/api/question/questions-set.php";
const answerUrl =
  "https://fairshake.com.au/trivia-game/administrator/api/question/set-statistic.php";

// data
let categoriesInit = [];
let categories = [];

let questionsInit = [];
let questions = [];

let currentQuestion = {};
let currentAnswers = [];
let hintAnswers = [];

let correctAnswer = 0;
let wrongAnswer = 0;
let score = 0;

let qCorrect = 0;
let qWrong = 0;
let qReported = 0;
let qId = "";

// pageSettings
const categoriesPerPage = 4;
let categoriesIndex = 0;

const questionsPerGame = 10;
let questionIndex = 0;

let isSoundOn = true;

// pages
let introPage = $("#intro");
let categoryPage = $("#category");
let playPage = $("#play");
let resultPage = $("#result");

// element
let headerLogo = $("#headerLogo");
let gameTitle = $("#gameTitle");
let backButton = $("#backButton");
let resetButton = $("#resetButton");
let hintButton = $("#hintButton");
let dateText = $("#dateText");
let timerButton = $("#timerButton");
let replayButton = $("#playAgainButton");
let questionNumber = $("#questionNumber");
let questionText = $("#questionText");
let categoriesList = $("#categoriesList");
let timerText = $("#timerText");
let settingMenu = $("#settingMenu");
let headerScore = $("#headerScore");
let headerButton = $("#headerButton");
let scoreText = $("#resultScoreText");
let correctText = $("#correctText");
let wrongText = $("#wrongText");

let openSettingButton = $("#openSettingButton");
let closeSettingButton = $("#closeSettingButton");
let toggleSoundButton = $("#toggleSoundButton");

let startButton = $("#startButton");
let answerButtons = $("#answerButtons");

let nextIndexButton = $("#nextIndexButton");
let prevIndexButton = $("#prevIndexButton");

let resetModal = $("#resetModal");
let pauseModal = $("#pauseModal");

let resetYesButton = $("#resetModalYesButton");
let resetNoButton = $("#resetModalNoButton");

let resumeButton = $("#resumeButton");
let surrenderButton = $("#surrenderButton");

// timer
let sec = 0;
let mnt = 0;
let hrs = 0;
let timer;

// loader
let loaderTime = 10;
let loadingTime = 0;
let percentage = 1;

// Audio
const clickAudio = new Audio("./assets/audio/click.ogg");
const selectAudio = new Audio("./assets/audio/selectAnswer.ogg");
const correctAudio = new Audio("./assets/audio/answerCorrect.ogg");
const wrongAudio = new Audio("./assets/audio/answerWrong.ogg");
const resultAudio = new Audio("./assets/audio/result.ogg");

const showIntroPage = () => {
  introPage.removeClass("hide");
  categoryPage.addClass("hide");
  playPage.addClass("hide");
  resultPage.addClass("hide");

  headerLogo.addClass("hide");
  backButton.addClass("hide");
  resetButton.addClass("hide");
  gameTitle.addClass("mx-auto");
  openSettingButton.addClass("hide");
  hintButton.addClass("hide");
  timerButton.addClass("hide");
  headerScore.addClass("hide");

  loading();
};

const showCategoryPage = () => {
  introPage.addClass("hide");
  categoryPage.removeClass("hide");
  playPage.addClass("hide");
  resultPage.addClass("hide");
  openSettingButton.removeClass("hide");
  headerLogo.removeClass("hide");
  dateText.text(moment().format("dddd, D MMMM YYYY"));
  headerScore.addClass("hide");
  timerButton.addClass("hide");
  hintButton.addClass("hide");
  resetButton.addClass("hide");
  gameTitle.removeClass("hide");
  headerButton.removeClass("hide");
  headerLogo.removeClass("mx-auto");
};

const showPlayPage = () => {
  introPage.addClass("hide");
  categoryPage.addClass("hide");
  playPage.removeClass("hide");
  resultPage.addClass("hide");
  hintButton.removeClass("hide");
  timerButton.removeClass("hide");
  headerLogo.addClass("hide");
  resetButton.removeClass("hide");
  headerScore.removeClass("hide");

  if ($(window).width() > 768) {
    gameTitle.removeClass("hide");
    gameTitle.removeClass("mx-auto");
  } else {
    gameTitle.addClass("hide");
  }

  getRandomQuestions();
  playGame();
};

const showResultPage = () => {
  playResult();
  introPage.addClass("hide");
  categoryPage.addClass("hide");
  playPage.addClass("hide");
  resultPage.removeClass("hide");

  timerButton.addClass("hide");
  hintButton.addClass("hide");
  openSettingButton.addClass("hide");
  settingMenu.addClass("hide");
  gameTitle.removeClass("hide").addClass("mx-auto");
  headerScore.addClass("hide");
  resetButton.addClass("hide");
  headerLogo.removeClass("hide").addClass("mx-auto");
  headerButton.addClass("hide");

  showScore();
};

const loading = () => {
  $("#startButton").addClass("hide");
  if (loadingTime == 0) loadingTime = 1;
  const bar = $("#loadingBar");
  const progress = () => {
    $("#progressText").text(percentage + " %");
    if (percentage >= 100) {
      clearInterval(id);
      loadingTime = 0;

      setInterval(() => {
        $("#loader").addClass("hide");
        $("#startButton").removeClass("hide");
      }, 1000);
    } else {
      percentage++;
      bar.css("width", percentage + "%");
    }
  };
  let id = setInterval(progress, loaderTime);
};

const getCategories = () => {
  $.ajax({
    url: categoriesUrl,
    dataType: "json",
  })
    .done(setCategories)
    .fail((err) => console.log(err));
};

const setCategories = (data) => {
  data.records.forEach((category) => {
    categoriesInit.push(category);
  });

  showCategories();
};

const showCategories = () => {
  categoriesList.empty();

  const colorList = ["yellow", "green", "blue", "navy", "red"];

  categories = categoriesInit.slice(
    categoriesIndex * categoriesPerPage,
    categoriesPerPage * categoriesIndex + categoriesPerPage
  );

  let LastIndex = Math.round(categoriesInit.length / categoriesPerPage) - 1;

  if (categoriesIndex == 0) {
    prevIndexButton.addClass("hide");
  } else {
    prevIndexButton.removeClass("hide");
  }

  if (categoriesIndex == LastIndex) {
    nextIndexButton.addClass("hide");
  } else {
    nextIndexButton.removeClass("hide");
  }

  categories.forEach((cat) => {
    let categoryLevel = $('<div class="category__item__level"></div>');

    for (let i = 1; i <= parseInt(cat.difficulty); i++) {
      categoryLevel.append(
        $(
          '<img src="./assets/img/icon-star.png" class="mt-3 mr-1" alt="level" />'
        )
      );
    }

    let categoryCard =
      '<div id="' +
      cat.name +
      '" class="category__selector col-6 col-md-4 col-lg-3 py-3  animate__bounceIn">' +
      '<div class="category__item category__item--' +
      colorList[Math.floor(Math.random() * colorList.length)] +
      ' d-flex flex-column justify-content-end">' +
      '<h1 class="category__item__title">' +
      cat.name +
      "</h1>" +
      categoryLevel[0].outerHTML +
      "</div>" +
      "</div>";

    categoriesList.append(categoryCard);
  });
};

const getQuestions = (cat) => {
  $.ajax({
    url: questionUrl,
    dataType: "json",
    type: "post",
    data: JSON.stringify({ category: cat }),
  }).done(setQuestions);
};

const setQuestions = (data) => {
  questionsInit = [];
  console.log(data);
  data.records.forEach((question) => {
    questionsInit.push(question);
  });

  showPlayPage();
};

const getRandomQuestions = () => {
  questions = [];
  let shuffledQuestions = questionsInit.sort(() => {
    return 0.5 - Math.random();
  });

  shuffledQuestions.slice(0, questionsPerGame).forEach((question) => {
    questions.push(question);
  });

  console.log(questions);
};

const playGame = () => {
  questionIndex = 0;
  score = 0;
  correctAnswer = 0;
  wrongAnswer = 0;
  showQuestion();
};

const showScore = () => {
  let str = "" + score;
  let pad = "000000";
  let scores = pad.substring(0, pad.length - str.length) + str;
  headerScore.children("span").text(scores);
  scoreText.text(score);
  wrongText.text(wrongAnswer);
  correctText.text(correctAnswer);
};

const showQuestion = () => {
  resetTimer();
  showScore();

  qCorrect = 0;
  qWrong = 0;
  qReported = 0;

  answerButtons.empty();
  questionText.empty();

  currentQuestion = questions[questionIndex];

  qId = currentQuestion.id;

  questionNumber.text(questionIndex + 1 + "/" + questionsPerGame);
  let answers = [];
  answers.push(currentQuestion.correct_answer);
  answers.push(currentQuestion.incorrect_answer1);
  answers.push(currentQuestion.incorrect_answer2);
  answers.push(currentQuestion.incorrect_answer3);

  hintAnswers = [];
  hintAnswers.push(currentQuestion.incorrect_answer1);
  hintAnswers.push(currentQuestion.incorrect_answer2);

  currentAnswers = answers.sort(() => Math.random() - 0.5);

  questionText.html(currentQuestion.question);

  for (let i = 0; i < currentAnswers.length; i++) {
    let answerButton =
      '<div class="play__answer__selector col-12 col-md-6 mt-3">' +
      '<a class="btn btn--answer btn--yellow d-flex align-items-center justify-content-center px-3 animate__bounceIn">' +
      '<div class="btn--icon"></div>' +
      '<span class="play__answer__text bold">' +
      currentAnswers[i];
    ("</span></a></div>");

    setTimeout(() => {
      answerButtons.append(answerButton);
    }, (i + 1) * 200);
  }
};

const startTimer = () => {
  $("#pauseIcon").removeClass("hide");
  $("#playIcon").addClass("hide");
  timerText.removeClass("text-red");
  timer = setInterval(tick, 1000);
};

const tick = () => {
  sec++;

  if (sec >= 60) {
    sec = 0;
    mnt++;
    if (mnt >= 60) {
      mnt = 0;
      hrs++;
    }
  }

  let secText = sec;
  let mntText = mnt;
  let hrsText = hrs;

  if (sec < 10) {
    secText = "0" + secText;
  } else {
    secText = sec;
  }

  if (mnt < 10) {
    mntText = "0" + mntText;
  } else {
    mntText = mnt;
  }

  if (hrs < 10) {
    hrsText = "0" + hrsText;
  } else {
    hrsText = hrs;
  }
  timerText.text(hrsText + ":" + mntText + ":" + secText);
};

const pauseTimer = () => {
  clearInterval(timer);
};

const stopTimer = () => {
  $("#pauseIcon").addClass("hide");
  $("#playIcon").removeClass("hide");
  clearInterval(timer);
  timerText.addClass("text-red");
};

const resetTimer = () => {
  stopTimer();
  sec = 0;
  mnt = 0;
  hrs = 0;
  timerText.text("00:00:00");
  startTimer();
};

const correctAnswerClicked = () => {
  correctAnswer++;
  qCorrect = 1;

  if (sec < 2 && mnt == 0 && hrs == 0) {
    score = score + 15;
  } else {
    score = score + 10;
  }

  $.ajax({
    url: answerUrl,
    dataType: "json",
    type: "post",
    data: JSON.stringify({
      incorrect_count: qWrong,
      correct_count: qCorrect,
      reported: qReported,
      question_id: qId,
    }),
  }).done((e) => {
    if (questionIndex + 1 < questionsPerGame) {
      questionIndex++;
      showQuestion();
    } else {
      showResultPage();
    }
  });
};

const wrongAnswerClicked = () => {
  qWrong++;
  score = score - 2;
  wrongAnswer++;
};

const showResetModal = () => {
  $("body").addClass("modal");
  resetModal.removeClass("hide");
};

const showPauseModal = () => {
  $("body").addClass("modal");
  pauseModal.removeClass("hide");
};

const closeModal = () => {
  $("body").removeClass("modal");
  pauseModal.addClass("hide");
  resetModal.addClass("hide");
};

const playClick = () => {
  if (isSoundOn) {
    clickAudio.play();
  }
};

const playCorrect = () => {
  if (isSoundOn) {
    correctAudio.play();
  }
};

const playWrong = () => {
  if (isSoundOn) {
    wrongAudio.play();
  }
};

const playResult = () => {
  if (isSoundOn) {
    resultAudio.play();
  }
};

const toggleSound = () => {
  isSoundOn = !isSoundOn;
  if (isSoundOn) {
    $("#soundOnIcon").removeClass("hide");
    $("#muteIcon").addClass("hide");
  } else {
    $("#soundOnIcon").addClass("hide");
    $("#muteIcon").removeClass("hide");
  }
};

$("document").ready(() => {
  getCategories();
  showIntroPage();

  $(".btn").click(() => {
    playClick();
  });

  openSettingButton.click(() => {
    settingMenu.removeClass("hide");
  });

  closeSettingButton.click(() => {
    settingMenu.addClass("hide");
  });

  toggleSoundButton.click(() => {
    toggleSound();
  });

  startButton.click(() => {
    showCategoryPage();
  });

  nextIndexButton.click(() => {
    categoriesIndex++;
    showCategories();
  });

  prevIndexButton.click(() => {
    categoriesIndex--;
    showCategories();
  });

  categoriesList.on("click", ".category__selector", (e) => {
    getQuestions(e.currentTarget.id);
  });

  answerButtons.on("click", ".play__answer__selector", (e) => {
    let selectedAnswer = $(e.currentTarget)
      .children()
      .children(".play__answer__text")
      .text();

    let thisBtn = $(e.currentTarget).children(".btn--answer");

    if (thisBtn.hasClass("btn--disabled")) {
      e.preventDefault();
    } else {
      thisBtn
        .parent()
        .siblings()
        .addBack()
        .children()
        .addClass("btn--disabled");
      thisBtn.removeClass("animate__bounceIn");
      thisBtn.addClass("animate__heartBeat");

      setTimeout(() => {
        thisBtn.removeClass("animate__heartBeat");
        if (selectedAnswer == currentQuestion.correct_answer) {
          pauseTimer();
          playCorrect();
          thisBtn.addClass("btn--correct");

          setTimeout(() => {
            correctAnswerClicked();
          }, 1000);
        } else {
          playWrong();
          thisBtn.addClass("btn--wrong");
          thisBtn
            .parent()
            .siblings()
            .children()
            .not(".btn--wrong")
            .not(".btn--dim")
            .removeClass("btn--disabled");
          wrongAnswerClicked();
        }
      }, 1000);
    }
  });

  replayButton.click(() => {
    showCategoryPage();
  });

  hintButton.click(() => {
    hintAnswers.forEach((hint) => {
      let x = $(`span:contains(${hint})`);
      x.parent().addClass("btn--disabled btn--dim");
    });
  });

  resetButton.click(() => {
    showResetModal();
    stopTimer();
  });

  resetYesButton.click(() => {
    closeModal();
    showCategoryPage();
    resetTimer();
  });

  resetNoButton.click(() => {
    closeModal();
    startTimer();
  });

  timerButton.click(() => {
    showPauseModal();
    stopTimer();
    showPauseModal();
  });

  resumeButton.click(() => {
    closeModal();
    startTimer();
  });

  surrenderButton.click(() => {
    playResult();
    closeModal();
    showResultPage();
  });

  // tooltips
  tippy("#timerButton", {
    content: "pause",
    theme: "custom",
    placement: "bottom-end",
  });

  tippy("#hintButton", {
    content: "hint wrong answer",
    theme: "custom",
    placement: "bottom",
  });

  tippy("#openSettingButton", {
    content: "setting",
    theme: "custom",
    placement: "bottom",
  });
});
