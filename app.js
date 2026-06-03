const API = "https://script.google.com/macros/s/AKfycbwQuj1bRwLJPQp1b4u_oiNduCu4oBGCV72nAZ8zoWm60KRb6_OCFd8W1eHGyX5OhVLOew/exec";

let myCode = "";
let myName = "";
let currentFriend = "";

/* ---------------- API ---------------- */

async function api(data) {
  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return await res.json();
}

/* ---------------- AUTH ---------------- */

async function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await api({
    action: "signup",
    username,
    password
  });

  if (res.success) {
    document.getElementById("friendCode").innerText =
      "Your Code: " + res.friendCode;
  } else {
    alert(res.message || "Signup failed");
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await api({
    action: "login",
    username,
    password
  });

  if (!res.success) {
    alert("Login failed");
    return;
  }

  myCode = res.friendCode;
  myName = res.username;

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "flex";

  document.getElementById("myCode").innerText = myCode;
  document.getElementById("myName").innerText = myName;

  loadFriends();
  loadRequests();
}

/* ---------------- FRIEND CODE COPY ---------------- */

function copyCode() {
  navigator.clipboard.writeText(myCode);
  alert("Friend code copied");
}

/* ---------------- FRIEND REQUESTS ---------------- */

async function addFriend() {
  const code = document.getElementById("friendInput").value;

  const res = await api({
    action: "sendFriendRequest",
    from: myCode,
    to: code
  });

  alert(res.message || "Request sent");
  loadRequests();
}

async function loadRequests() {
  const res = await api({
    action: "getFriendRequests",
    user: myCode
  });

  const box = document.getElementById("requests");
  box.innerHTML = "";

  res.forEach(r => {
    const div = document.createElement("div");
    div.className = "request";

    div.innerHTML = `
      <span>${r.code}</span>
      <button onclick="acceptFriend('${r.code}')">Accept</button>
    `;

    box.appendChild(div);
  });
}

async function acceptFriend(friendCode) {
  await api({
    action: "acceptFriend",
    user: myCode,
    friend: friendCode
  });

  loadFriends();
  loadRequests();
}

/* ---------------- FRIEND LIST ---------------- */

async function loadFriends() {
  const res = await api({
    action: "getFriends",
    user: myCode
  });

  const list = document.getElementById("friends");
  list.innerHTML = "";

  res.forEach(f => {
    const li = document.createElement("li");
    li.innerText = f.username || f.code;

    li.onclick = () => {
      currentFriend = f.code;
      document.getElementById("chatTitle").innerText = f.username;
      loadMessages();
    };

    list.appendChild(li);
  });
}

/* ---------------- MESSAGES ---------------- */

async function loadMessages() {
  if (!currentFriend) return;

  const res = await api({
    action: "getMessages",
    user: myCode,
    friend: currentFriend
  });

  const box = document.getElementById("messages");
  box.innerHTML = "";

  res.forEach(m => {
    const div = document.createElement("div");

    div.className =
      "msg " + (m.from === myCode ? "me" : "them");

    div.innerText = m.message;

    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

async function sendMessage() {
  const text = document.getElementById("messageBox").value;
  if (!text || !currentFriend) return;

  await api({
    action: "sendMessage",
    from: myCode,
    to: currentFriend,
    message: text
  });

  document.getElementById("messageBox").value = "";
  loadMessages();
}

/* ---------------- AUTO REFRESH ---------------- */

setInterval(() => {
  if (myCode) {
    loadRequests();
    if (currentFriend) {
      loadMessages();
    }
  }
}, 4000);
