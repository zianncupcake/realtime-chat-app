'use strict';

var usernamePage = document.querySelector('#username-page')
var chatPage = document.querySelector('#chat-page')
var messageForm = document.querySelector('#messageForm')
var usernameForm = document.querySelector('#usernameForm')
var messageInput = document.querySelector('#message')
var messageArea = document.querySelector('#messageArea')
var connectingElement = document.querySelector('.connecting') //css class

var stompClient = null;
var username = null
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if (username) {
        usernamePage.classList.add('hidden') //hide the username page
        chatPage.classList.remove('hidden') //show the chat page

        var socket = new SockJS('/ws')
        stompClient = Stomp.over(socket)
        stompClient.connect({}, onConnected, onError) //connect to client
    }
    event.preventDefault()
}

function onConnected() {
    //subscribe to public topic
    //pass in callback method
    stompClient.subscribe('/topic/public', onMessageReceived )

    //tell username to server --> send to controller --> inform that new user has joined
    stompClient.send('/app/chat.addUser',{}, JSON.stringify({sender: username, type:'JOIN'}))
    connectingElement.classList.add('hidden') //hide connecting component after it has been connected
}

function onError(error) {
    connectingElement.textContent="Could not connected to WebSocket server. Please refresh this page and try again" //change text of connecting element
    connectingElement.style.color = 'red'
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim()

    if (messageContent && stompClient) {
        var chatMessage ={sender: username, content:messageInput.value, type:'CHAT'}
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage))
        messageInput.value = '' //empty after each input sent
    
    }
    event.preventDefault()

}

function onMessageReceived(payload) {
    //extract body from payload
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        //message bubbles
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]); //first letter of sender name
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight //scroll to the bottom so to always show the latest message
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)