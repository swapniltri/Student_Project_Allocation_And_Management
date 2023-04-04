var temp=0;
var showit = function(){
    if(temp==0)
    document.querySelector("#id2").style.display = "block";
    else
    document.querySelector("#id2").style.display = "none";
    temp=(temp===0?1:0);
}

document.querySelector("#id1").addEventListener("click",showit);

var showChatBox = function(){
    document.querySelector("#chat-wrapper").classList.add("chat--visible");
};

var hideChatBox = function(){
    document.querySelector("#chat-wrapper").classList.remove("chat--visible");
};

var socket = io();
var messages = document.getElementById('chat');
var form = document.getElementById('chatForm');
var input = document.getElementById('chatField');
var userFixed = document.getElementById('userFixed');

form.addEventListener('submit', function (e) {
    console.log("hey i got msg");
    e.preventDefault();
    if (input.value) {
        var obj = { message: input.value, username: userFixed.value };
        socket.emit('chat_message', obj);
        input.value = '';
    }
});

socket.on('chat_message', function (msg) {

    console.log("hey i got msg");

    var item = document.createElement('div');
    if(msg.username==userFixed.value){
        item.classList.add('chat-self');
        item.innerHTML=`<div class="chat-message">
          <div class="chat-message-inner">
            ${msg.message}
          </div>
        </div>`
    }
    else{
        item.classList.add('chat-other');
        item.innerHTML = `<a href="/profile/${msg.username}"></a><div class="chat-message"><div class="chat-message-inner"><a href="/profile/${msg.username}"><strong>${msg.username}:</strong></a> ${msg.message}</div></div>`;
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

document.querySelector("#chat-icon").addEventListener("click",showChatBox);
document.querySelector("#cross-icon").addEventListener("click",hideChatBox);


