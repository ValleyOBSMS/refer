const url =
  "https://script.google.com/macros/s/AKfycbxzvHHWjPhZTXw2ggneh7n2WHrNA_2onGcX0gOIP-o0jFAMrVSLNFy4kTRdQ6K8TnfxQw/exec";
let password = "";
let username = "";
let token = "";

function getTime(date) {
  let time = new Date(date);
  return (
    String(time.getHours()).padStart(2, "0") +
    ":" +
    String(time.getMinutes()).padStart(2, "0") +
    ":" +
    String(time.getSeconds()).padStart(2, "0")
  );
}

function dateCovert(date) {
  date = new Date(date);
  return (
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    "-" +
    date.getFullYear()
  );
}

function loadHistory(data = []) {
  let dataRows = document.getElementById("dataRows");

  dataRows.innerHTML = "";

  let finalHtml = "";

  for (let i = 0; i < data.length; i++) {
    let { ts, name, friendName, email, phone } = data[i];
    finalHtml += `
    <tr>
      <td>${i + 1}</td>
      <td>
        <span>${dateCovert(ts)}</span> &nbsp;&nbsp; 
        <span> ${getTime(ts)}</span>
      </td>
      <td>${name}</td>
      <td>${friendName}</td>
      <td>${email}</td>
      <td>${phone}</td>
    </tr>`;
  }

  dataRows.innerHTML = finalHtml;
}

function adminHomeLoad(data) {
  let form = document.forms["searchForm"];
  let loading = document.getElementById("loading");
  let clearAllBtn = document.getElementById("clearAllBtn");

  loadHistory(data);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    loading.style.display = "block";
    let serarchValue = form["search"].value;
    /** fetch history */
    let reqBody = {
      action: "getReferrals",
      payload: {
        password,
        username,
        token,
      },
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "success") {
          loading.style.display = "none";
          loadHistory(
            data.data.filter(({ name, friendName, email }) => {
              return (
                String(name)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0 ||
                String(friendName)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0 ||
                String(email)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0
              );
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
    /** fetch history */

    return false;
  });

  clearAllBtn.addEventListener("click", (e) => {
    clearAllBtn.innerText = "Processing..";
    loading.style.display = "block";

    /** fetch history */
    let reqBody = {
      action: "clearAll",
      payload: {
        password,
        username,
        token,
      },
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "success") {
          loading.style.display = "none";
          clearAllBtn.innerText = "Clear History";
          loadHistory(
            data.data.filter(({ name, friendName, email }) => {
              return (
                String(name)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0 ||
                String(friendName)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0 ||
                String(email)
                  .toLowerCase()
                  .indexOf(serarchValue.toLowerCase()) >= 0
              );
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function loginLoad() {
  let root = document.getElementById("root");
  let loading = document.getElementById("loading");
  let form = document.forms["loginForm"];
  let error = document.getElementById("error");
  let forgotBtn = document.getElementById("forgotBtn");

  forgotBtn.addEventListener("click", () => {
    error.innerHTML = "";
    loading.style.display = "block";

    let reqBody = {
      action: "forgotPassword",
      payload: {},
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        loading.style.display = "none";
        if (data.message === "success") {
          $("#submitModal").modal({
            backdrop: "static",
          });
        } else {
          error.innerHTML = data.error;
        }
      })
      .catch((err) => {
        console.log(err);
        loading.style.display = "none";
        error.innerHTML = "Something went wrong. Please try again later.";
      });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.innerHTML = "";
    loading.style.display = "block";

    username = form["username"].value;
    password = form["password"].value;

    let reqBody = {
      action: "adminLogin",
      payload: {
        password,
        username,
      },
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "success") {
          token = data.token;

          /** fetch history */
          let reqBody = {
            action: "getReferrals",
            payload: {
              password,
              username,
              token,
            },
          };

          fetch(url, {
            method: "POST",
            body: JSON.stringify(reqBody),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.message === "success") {
                let history = data.data;
                /** fetch admin-home */
                fetch("./admin-home.html?" + new Date().getTime())
                  .then((res) => res.text())
                  .then((res) => {
                    let data = res.substring(
                      res.indexOf("<body>") + 6,
                      res.indexOf("</body>")
                    );
                    // console.log(data);
                    loading.style.display = "none";
                    root.innerHTML = data;
                    adminHomeLoad(history);
                  })
                  .catch((err) => {
                    console.log(err);
                    loading.style.display = "none";
                    error.innerHTML =
                      "Something went wrong. Please try again later.";
                  });
                /** fetch admin-home */
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
          /** fetch history */
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
