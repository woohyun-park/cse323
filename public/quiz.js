// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

let CurPair, Filter;

const init = async () => {
  await $.ajax({
    type: "GET",
    url: "https://development-korea-seoul.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv",
    data: {},
    dataType: "text",
    success: (res) => {
      window.pairs = res
        .split("\r\n")
        .slice(1)
        .map((each) => {
          const temp = each.split(",");
          return { country: temp[0], capital: temp[1] };
        });
    },
    error: (err) => alert("Failed: " + err),
  });
  CurPair = {};
  Filter = "all";
  $("#all").click(() => {
    Filter = "all";
    displayPrevQuestions();
  });
  $("#correct").click(() => {
    Filter = "correct";
    displayPrevQuestions();
  });
  $("#incorrect").click(() => {
    Filter = "incorrect";
    displayPrevQuestions();
  });
};

const createNewQuestion = () => {
  const rand = Math.floor(Math.random() * window.pairs.length);
  const { country, capital } = window.pairs[rand];
  $("#quiz-question").html(country);
  $("#quiz-answer").val("");
  $("#quiz-answer").focus();
  CurPair = { country, capital };
};

const displayPrevQuestions = () => {
  if (Filter === "all") {
    $("tr").filter($(".correct")).css("display", "table-row");
    $("tr").filter($(".incorrect")).css("display", "table-row");
  } else if (Filter === "correct") {
    $("tr").filter($(".incorrect")).css("display", "none");
    $("tr").filter($(".correct")).css("display", "table-row");
  } else if (Filter === "incorrect") {
    $("tr").filter($(".correct")).css("display", "none");
    $("tr").filter($(".incorrect")).css("display", "table-row");
  }
};

const initQuestions = (capital, country, answer, id) => {
  if (answer == undefined) {
    answer = $("#quiz-answer").val();
  }
  if (answer === capital) {
    $("#filter").after(
      $(`        <tr class="correct" id=${id}>
    <td id="quiz-question">${country}</td>
    <td>${capital}</td>
    <td><i class="fas fa-check"></i>${" "}<button id="delete">delete</button></td>
    </tr>`)
    );
  } else {
    $("#filter").after(
      $(`        <tr class="incorrect" id=${id}>
    <td id="quiz-question">${country}</td>
    <td>${answer}</td>
    <td>${capital}${" "}<button id="delete">delete</button></td>
    </tr>`)
    );
  }

  if (
    (answer === capital && $("#incorrect").is(":checked")) ||
    (answer !== capital && $("#correct").is(":checked"))
  ) {
    $("#all").prop("checked", true);
    Filter = "all";
  }

  addDeleteEvent(id);
};

const addPrevQuestions = (capital, country, answer) => {
  let id;
  if (answer == undefined) {
    answer = $("#quiz-answer").val();
  }
  if (answer === capital) {
    db.collection("history")
      .add({
        capital,
        country,
        answer,
        status: true,
        createdAt: new Date(),
      })
      .then((docRef) => {
        id = docRef.id;
      });
    $("#filter").after(
      $(`        <tr class="correct" id=${id}>
    <td id="quiz-question">${country}</td>
    <td>${capital}</td>
    <td><i class="fas fa-check"></i>${" "}<button id="delete">delete</button></td>
    </tr>`)
    );
  } else {
    db.collection("history")
      .add({
        capital,
        country,
        answer,
        status: false,
        createdAt: new Date(),
      })
      .then((docRef) => {
        id = docRef.id;
      });
    $("#filter").after(
      $(`        <tr class="incorrect" id=${id}>
    <td id="quiz-question">${country}</td>
    <td>${answer}</td>
    <td>${capital}${" "}<button id="delete">delete</button></td>
    </tr>`)
    );
  }

  if (
    (answer === capital && $("#incorrect").is(":checked")) ||
    (answer !== capital && $("#correct").is(":checked"))
  ) {
    $("#all").prop("checked", true);
    Filter = "all";
  }
};

const addDeleteEvent = (id) => {
  $("#delete").click(function () {
    db.collection("history").doc(id).delete();
    $(this).closest("tr").remove();
  });
};

const loadHistory = () => {
  db.collection("history")
    .orderBy("createdAt")
    .get()
    .then((querySnapshot) => {
      const arr = [];
      querySnapshot.forEach((doc) => {
        arr.push(doc);
      });
      arr.forEach((doc) => {
        const data = doc.data();
        initQuestions(data.capital, data.country, data.answer, doc.id);
      });
    });
};

$(document).ready(async () => {
  await init();
  loadHistory();
  createNewQuestion();
});

$("#quiz-submit").click(() => {
  addPrevQuestions(CurPair.capital, CurPair.country);
  createNewQuestion();
  displayPrevQuestions();
  addDeleteEvent();
});

$("#clear").click(() => {
  const arr = $("#filter").nextAll();
  for (each of arr) {
    db.collection("history").doc(each.id).delete();
    each.remove();
  }
});
