const emailInp = document.getElementById("email");
const passwordInp = document.getElementById("password");
const sEmail = document.getElementById("sEmail");
const passInp = document.getElementById("pass");
const cPassInp = document.getElementById("cPass");
const fullnameInp = document.getElementById("fullname");

const loginBtn = document.querySelector(".loginBtn");
const signupBtn = document.querySelector(".signupBtn");

const loginBtnShow = document.getElementById("login");
const signupBtnShow = document.getElementById("signup");

loginBtnShow.addEventListener("click", (e) => {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (element !== "slide-up") {
      parent.classList.add("slide-up");
    } else {
      loginBtnShow.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});

signupBtnShow.addEventListener("click", (e) => {
  let parent = e.target.parentNode;
  Array.from(e.target.parentNode.classList).find((element) => {
    if (element !== "slide-up") {
      parent.classList.add("slide-up");
    } else {
      signupBtnShow.parentNode.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});

loginBtn.addEventListener("click", async () => {
  const email = emailInp.value;
  const password = passwordInp.value;
  const res = await fetch("/auth/login", {
    headers: {
      "Content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email, password }),
  }); // added closing parenthesis

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem(
      "user-info",
      JSON.stringify({ name: data.fullname, email: data.email })
    );
    window.location.href = "/";
  } else {
    alert("Invalid email or password");
  }
});

signupBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = sEmail.value;
  const pass = passInp.value;
  const fullname = fullnameInp.value;
  const cPass = cPassInp.value;

  if (cPass !== pass) {
    alert("Password not matched");
    return;
  }

  console.log(email, pass, fullname, cPass);

  const res = await fetch("/auth/register", {
    headers: {
      "Content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email, password: pass, fullname }),
  }); // added closing parenthesis

  const data = await res.json();
  localStorage.setItem(
    "user-info",
    JSON.stringify({ name: data.fullname, email: data.email })
  );

  window.location.href = "/";
});
