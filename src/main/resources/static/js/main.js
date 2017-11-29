'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var userArea = document.querySelector('#userArea');

// ////////////////
var registryPage = document.querySelector('#registry-page');
var registryForm = document.querySelector("#registryForm");
// ///////////////////

var stompClient = null;
var username = null;

var curUserName;
var curUserId

///////////////////////////////////////////////////////////
// registry
$('[id="registryLink"]').click(function() {
	usernamePage.classList.add('hidden');
	registryPage.classList.remove('hidden');
})
$('[id="returnLogin"]').click(function() {
	registryPage.classList.add('hidden');
	usernamePage.classList.remove('hidden');
})

var username;
var pass;

function createUser(event) { // XXX
	
	
	var newUser = document.getElementById('newUserName').value;
	curUserName = document.getElementById('newUserName').value;

	var firstPass = document.getElementById('firstPass').value;
	var secondPass = document.getElementById('secondPass').value;

	if (newUser) {
		if (firstPass === secondPass && firstPass != '') {
			usernamePage.classList.add('hidden');
			chatPage.classList.remove('hidden');
			connectingElement.classList.add('hidden');
			
			var socket = new SockJS('/ws');
			stompClient = Stomp.over(socket);
			stompClient.connect({}, onCreated, onError);
			
			event.preventDefault();
			pass = document.getElementById('firstPass').value;
		} else {
			alert('pass')
		}
	} else {
		alert('login')
	}

}
function onCreated() {
	
	
	var newUser = {name : curUserName,password : pass};
	stompClient.send("/app/chat.createUser", {}, JSON.stringify(newUser));
	//stompClient.subscribe('/channel/public', onUserReceived);

	registryPage.classList.add('hidden');
	
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({
		user : curUserName,
		type : 'JOIN'
	}))

	//curUserName = username;

	var uploadMessage = {
		user : curUserName,
		type : "UPLOAD"
	};
	stompClient.send("/app/chat.uploadData", {}, JSON.stringify(uploadMessage));
	event.preventDefault();

	connectingElement.classList.add('hidden');

	
	stompClient.subscribe('/channel/public',onMessageReceived);
	

}
function onUserReceived(payload) {
	
	
	registryPage.classList.add('hidden');
	
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({
		user : curUserName,
		type : 'JOIN'
	}))

	//curUserName = username;

	var uploadMessage = {
		user : curUserName,
		type : "UPLOAD"
	};
	stompClient.send("/app/chat.uploadData", {}, JSON.stringify(uploadMessage));
	event.preventDefault();

	connectingElement.classList.add('hidden');

	
	stompClient.subscribe('/channel/public',onMessageReceived);
}
///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function connect(event) {
	
	

	username = document.querySelector('#name').value.trim();
	
	if (username) {
		
		
		
		
		usernamePage.classList.add('hidden');
		registryPage.classList.add('hidden');
		chatPage.classList.remove('hidden');
		connectingElement.classList.add('hidden');
		
		
		var socket = new SockJS('/ws');
		stompClient = Stomp.over(socket);
		
		var socket = new SockJS('/ws');
		stompClient = Stomp.over(socket);
		
		curUserName=document.querySelector('#name').value.trim();
		
		
		
		
		stompClient.connect({}, onConnected, onError);
		
		
	}
	event.preventDefault();
}

function onConnected() {


	
	stompClient.subscribe('/channel/public', onMessageReceived);

	stompClient.send("/app/chat.addUser", {}, JSON.stringify({
		user : curUserName,
		type : 'JOIN'
	}))

	
	
	var uploadMessage = {
		user : curUserName,
		type : "UPLOAD"
	};
	stompClient.send("/app/chat.uploadData", {}, JSON.stringify(uploadMessage));
	event.preventDefault();


	

}

function onError(error) {
	
	
	connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
	connectingElement.style.color = 'red';
}

function sendMessage(event) { // XXX
	var messageContent = messageInput.value.trim();
	//alert(curUserName)
	if (messageContent && stompClient) {
		var chatMessage = {
			user : curUserName,// XXX
			content : messageInput.value,
			type : 'CHAT'
		};
		stompClient.send("/app/chat.sendMessage", {}, JSON
				.stringify(chatMessage));
		messageInput.value = '';
	}
	event.preventDefault();
}

function showUploadedMessages(item) {

	var messageElement = document.createElement('li');
	var alDiv = document.createElement('div');
	var userName = document.getElementById('userNameValue').value;

	var now = new Date();
	var bubble = document.createElement('div');
	alDiv.setAttribute("style", "float: left;");
	bubble.setAttribute("class", "talk-bubble tri-right left-top");
	var talktext = document.createElement('div');
	talktext.setAttribute("class", "talktext");
	var userNameInBubble = document.createElement('h3');
	userNameInBubble.innerHTML = item.user;
	userNameInBubble.setAttribute("id", "bubble-user");
	var bubbleMessage = document.createElement('p');
	bubbleMessage.textContent = item.content;
	bubbleMessage.setAttribute("id", "bubble-content");
	var bubbleTime = document.createElement('h5');
	// bubbleTime.textContent=timeValue;
	bubbleTime.textContent = now.format("dd mmm HH:mm"); // XXX // ПОМІНЯЙ
	// МЕНЕ ! Я НОРМ
	alDiv.appendChild(bubble);
	bubble.appendChild(talktext);
	talktext.appendChild(userNameInBubble);
	talktext.appendChild(bubbleMessage);
	talktext.appendChild(bubbleTime);
	messageElement.appendChild(alDiv);
	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
	var scrDowm = document.getElementById("messageDown");
	scrDowm.scrollIntoView();

}

function showUploadedUsers(item) {
	var newUser = document.createElement('li');
	newUser.setAttribute('value', item)
	newUser.innerHTML = item;
	userArea.appendChild(newUser);

}

function onMessageReceived(payload) {
	var message = JSON.parse(payload.body);
	var messageElement = document.createElement('li');

	if (message.type === 'JOIN') {

		var newUser = document.createElement('li');
		newUser.setAttribute('value', message.user)
		newUser.innerHTML = message.user;
		userArea.appendChild(newUser);

	} else if (message.type === 'LEAVE') {

		$('[value=' + message.user + ']').remove();
		messageElement.classList.add('event-message');
		message.content = message.user + ' left!';

	} else if (message.type === 'UPLOAD' && message.user === curUserName) {
		
		
		
		var inMes = message.upd;
		var mes = inMes.data;
		alert(inMes.data)
		inMes.data.forEach(function(item, i, arr) {
			showUploadedMessages(item);
		});
		alert(inMes.users)
		inMes.users.forEach(function(item, i, arr) {
			showUploadedUsers(item);
		});

	} else if (message.type === 'CHAT'){

		var alDiv = document.createElement('div');

		var timeValue = new Date().toTimeString().replace(
				/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

		var now = new Date();

		var bubble = document.createElement('div');

		if (curUserName == message.user) {
			alDiv.setAttribute("style", "float: right;");
			bubble.setAttribute("class", "talk-bubble tri-right right-top");

			bubble.setAttribute("id", "mineMessage");

		} else {
			alDiv.setAttribute("style", "float: left;");
			bubble.setAttribute("class", "talk-bubble tri-right left-top");
		}

		var talktext = document.createElement('div');
		talktext.setAttribute("class", "talktext");

		var userNameInBubble = document.createElement('h3');
		userNameInBubble.innerHTML = message.user;
		userNameInBubble.setAttribute("id", "bubble-user");

		var bubbleMessage = document.createElement('p');
		bubbleMessage.textContent = message.content;
		bubbleMessage.setAttribute("id", "bubble-content");

		var bubbleTime = document.createElement('h5');
		bubbleTime.textContent = timeValue;
		// bubbleTime.textContent=now.format("dd mmm HH:mm"); //XXX // ПОМІНЯЙ
		// МЕНЕ ! Я НОРМ

		alDiv.appendChild(bubble);
		bubble.appendChild(talktext);
		talktext.appendChild(userNameInBubble);
		talktext.appendChild(bubbleMessage);

		talktext.appendChild(bubbleTime);

		messageElement.appendChild(alDiv);
		messageArea.appendChild(messageElement);
		messageArea.scrollTop = messageArea.scrollHeight;

		var scrDowm = document.getElementById("messageDown");
		scrDowm.scrollIntoView();
	}
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
registryForm.addEventListener('submit', createUser, true)// XXX
