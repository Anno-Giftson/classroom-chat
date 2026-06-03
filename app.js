const API =
"https://script.google.com/macros/s/AKfycbxtmNAII4Heidtt7veMcNEFIRm2Y1druoJFCzTkSo4xk41x1XTd0Gf4XAM2gEb8MbLK_Q/exec";
let myCode = "";
let currentFriend = "";

async function api(data){

 const res = await fetch(API,{
   method:"POST",
   body:JSON.stringify(data)
 });

 return await res.json();
}

async function signup(){

 const username =
 document.getElementById("username").value;

 const password =
 document.getElementById("password").value;

 const result =
 await api({
   action:"signup",
   username,
   password
 });

 if(result.success){

   document.getElementById(
   "friendCode"
   ).innerText =
   "Friend Code: " +
   result.friendCode;
 }
}

async function login(){

 const username =
 document.getElementById("username").value;

 const password =
 document.getElementById("password").value;

 const result =
 await api({
   action:"login",
   username,
   password
 });

 if(result.success){

   myCode =
   result.friendCode;

   document.getElementById(
   "login"
   ).style.display="none";

   document.getElementById(
   "app"
   ).style.display="flex";

   loadFriends();
 }
}

async function addFriend(){

 const friend =
 document.getElementById(
 "friendInput"
 ).value;

 await api({
   action:"sendFriendRequest",
   from:myCode,
   to:friend
 });

 alert("Request sent");
}

async function loadFriends(){

 const friends =
 await api({
   action:"getFriends",
   user:myCode
 });

 const ul =
 document.getElementById(
 "friends"
 );

 ul.innerHTML="";

 friends.forEach(friend=>{

   const li =
   document.createElement("li");

   li.className="friend";

   li.innerText=friend;

   li.onclick=()=>{
     currentFriend=friend;
     loadMessages();
   };

   ul.appendChild(li);
 });
}

async function loadMessages(){

 const messages =
 await api({
   action:"getMessages",
   user:myCode,
   friend:currentFriend
 });

 const div =
 document.getElementById(
 "messages"
 );

 div.innerHTML="";

 messages.forEach(m=>{

   const msg =
   document.createElement("div");

   msg.className =
   "message " +
   (m[1]===myCode
   ? "me"
   : "them");

   msg.innerText = m[3];

   div.appendChild(msg);
 });
}

async function sendMessage(){

 const text =
 document.getElementById(
 "messageBox"
 ).value;

 await api({
   action:"sendMessage",
   from:myCode,
   to:currentFriend,
   message:text
 });

 document.getElementById(
 "messageBox"
 ).value="";

 loadMessages();
}

setInterval(()=>{
 if(currentFriend){
   loadMessages();
 }
},3000);
