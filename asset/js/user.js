const url = "https://us-central1-sms-vob.cloudfunctions.net/refer";
let password = "";

function setCaretPosition(e, pos) {
  // Modern browsers
  if (e.setSelectionRange) {
    e.focus();
    e.setSelectionRange(pos, pos);

    // IE8 and below
  } else if (e.createTextRange) {
    var range = e.createTextRange();
    range.collapse(true);
    range.moveEnd("character", pos);
    range.moveStart("character", pos);
    range.select();
  }
}

function inputPrevent(e) {
  if (e.inputType == "insertText" || e.inputType == "insertCompositionText") {
    let start = e.target.selectionStart - e.data.length;
    e.target.value =
      e.target.value.substr(0, e.target.selectionStart - e.data.length) +
      e.target.value.substr(e.target.selectionStart);
    setCaretPosition(e.target, start);
  }
}

function userHomeLoad() {
  let form = document.forms["userHomeForm"];
  let error = document.getElementById("error");
  let loading = document.getElementById("loading");

  form["name"].oninput = inputPrevent;
  form["friendName"].oninput = inputPrevent;
  form["email"].oninput = inputPrevent;
  form["phone"].oninput = inputPrevent;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.innerHTML = "";
    loading.style.display = "block";

    let name = form["name"].value.trim();
    let friendName = form["friendName"].value.trim();
    let email = form["email"].value.trim();
    let phone = form["phone"].value.trim();

    if (name.trim() === "") {
      loading.style.display = "none";
      error.innerHTML = "Please enter your name.";
    } else if (friendName.trim() === "") {
      loading.style.display = "none";
      error.innerHTML = "Please enter your friend's name.";
    } else if (email.trim() === "" && phone.trim() === "") {
      loading.style.display = "none";
      error.innerHTML = "Please enter your friend's email or phone number.";
    } else if (
      email.trim() != "" &&
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())
    ) {
      loading.style.display = "none";
      error.innerHTML = "Please enter a valid email address.";
    } else if (
      phone.trim() != "" &&
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        phone.trim()
      )
    ) {
      loading.style.display = "none";
      error.innerHTML = "Please enter a valid phone number.";
    } else {
      let reqBody = {
        action: "send",
        payload: {
          name,
          friendName,
          email,
          phone,
          password,
        },
      };

      fetch(url, {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "success") {
            loading.style.display = "none";
            form.reset();
            $("#submitModal").modal({
              backdrop: "static",
            });
          } else {
            loading.style.display = "none";
            error.innerHTML = data.error;
          }
        })
        .catch((err) => {
          console.log(err);
          loading.style.display = "none";
          error.innerHTML = "Something went wrong. Please try again later.";
        });
    }

    return false;
  });
}

function loginLoad() {
  let root = document.getElementById("root");
  let loading = document.getElementById("loading");
  let form = document.forms["loginForm"];
  let error = document.getElementById("error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.innerHTML = "";
    loading.style.display = "block";

    password = form["password"].value;

    let reqBody = {
      action: "userLogin",
      payload: {
        password,
      },
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "success") {
          /** fetch user-home */
          fetch("./user-home.html")
            .then((res) => res.text())
            .then((res) => {
              let data = res.substring(
                res.indexOf("<body>") + 6,
                res.indexOf("</body>")
              );
              // console.log(data);
              loading.style.display = "none";
              root.innerHTML = data;
              userHomeLoad();
            })
            .catch((err) => {
              console.log(err);
              loading.style.display = "none";
              error.innerHTML = "Something went wrong. Please try again later.";
            });
          /** fetch user-home */
        } else {
          loading.style.display = "none";
          error.innerHTML = data.error;
        }
      })
      .catch((err) => {
        console.log(err);
        loading.style.display = "none";
        error.innerHTML = "Something went wrong. Please try again later.";
      });

    return false;
  });
}

document.addEventListener("DOMContentLoaded", loginLoad);
