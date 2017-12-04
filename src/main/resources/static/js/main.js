'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var userArea = document.querySelector('#userArea');
var registryPage = document.querySelector('#registry-page');
var registryForm = document.querySelector("#registryForm");

var stompClient = null;
var username = null;

var curUserName;
var curUserId

$('[id="registryLink"]').click(function() {
	usernamePage.classList.add('hidden');
	registryPage.classList.remove('hidden');
	$('#name,#pass').val("")

})
$('#registryLink,#returnLogin').mouseover(function() {
	$(this).css('cursor', 'pointer');
	$(this).css('color', '#2196F3');
}).mouseout(function() {
	$(this).css('color', 'black');
});
$('[id="returnLogin"]').click(function() {
	registryPage.classList.add('hidden');
	usernamePage.classList.remove('hidden');
	$('#newUserName,#firstPass,#secondPass').val("")
})

var username;
var pass;

function createUser(event) {
	var newUser = document.getElementById('newUserName').value;
	curUserName = document.getElementById('newUserName').value;

	var firstPass = document.getElementById('firstPass').value;
	var secondPass = document.getElementById('secondPass').value;

	if (newUser) {
		if (firstPass === secondPass && firstPass != '') {
			usernamePage.classList.add('hidden');
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
	var newUser = {
		name : curUserName,
		password : pass
	};
	stompClient.send("/app/chat.createUser", {}, JSON.stringify(newUser));
	stompClient.subscribe('/channel/public', onUserReceived);
}
function onUserReceived(payload) {
	var user = JSON.parse(payload.body);
	if (user.id != -1) {
		$('#overlay').fadeIn(400, function() {
			$('#modal_form_success').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("[id='registryOK']").click(function() {
			location.reload();
		});
		$('#modal_form_success_name').html(curUserName);
		usernamePage.classList.add('hidden');
		chatPage.classList.add('hidden');
	} else if (user.name == curUserName) {
		$('#overlay').fadeIn(400, function() {
			$('#modal_form_fail').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("[id='registryFAIL']").click(function() {
			$('#modal_form_fail').animate({
				opacity : 0,
				top : '45%'
			}, 200, function() {
				$(this).css('display', 'none');
				$('#overlay').fadeOut(400);
			});
			$('#newUserName,#firstPass,#secondPass').val("")
		});
	}
}

function connect(event) {
	username = document.querySelector('#name').value.trim();
	if (username) {
		var socket = new SockJS('/ws');
		stompClient = Stomp.over(socket);
		curUserName = document.querySelector('#name').value.trim();
		stompClient.connect({}, onConnected, onError);
	}
	event.preventDefault();
}
function onConnected() {
	var newUser = {
		name : curUserName,
		password : document.getElementById('pass').value
	};
	stompClient.send("/app/chat.addUser", {}, JSON.stringify(newUser));
	var temp = stompClient.subscribe('/channel/public', onUserConnected,
			onError);
}
function onUserConnected(payload) {
	var user = JSON.parse(payload.body);
	if (user.id == -2) {
		$('[value=' + user.name + ']').empty();
		$('#userAct').html(user.name + " offline ")
		$('#leaveJoinForm').css('display', 'block').animate({
			opacity : 1,
			top : '80%'
		}, 200);
		setTimeout(func, 2000)
		function func() {
			$('#leaveJoinForm').animate({
				opacity : 0,
				top : '80%'
			}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	}
	console.log('id=' + user.id)
	if (user.id == -1 && user.name == curUserName) {
		$('#overlay').fadeIn(400, function() {
			$('#modal_form_login_fail').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("[id='logInFAIL']").click(function() {
			//location.reload();
			$('#modal_form_login_fail').animate({
				opacity : 0,
				top : '45%'
			}, 200, function() {
				$(this).css('display', 'none');
				$('#overlay').fadeOut(400);
			});
			$('#name,#pass').val("")
		});
	} else if (user.name == curUserName) {
		curUserId = user.id;
		stompClient.subscribe('/channel/public/data', onMessageReceived);
		usernamePage.classList.add('hidden');
		registryPage.classList.add('hidden');
		chatPage.classList.remove('hidden');
		connectingElement.classList.add('hidden');
		stompClient.send("/app/chat.uploadData", {}, JSON.stringify({
			user : user.name,
			type : 'JOIN'
		}))
		var uploadMessage = {
			user : curUserName,
			type : "UPLOAD"
		};
		stompClient.send("/app/chat.uploadData", {}, JSON
				.stringify(uploadMessage));
		event.preventDefault();
	}
}
function onError(payload) {
	alert("error")
}
function sendMessage(event) {
	var messageContent = messageInput.value.trim();
	if (messageContent && stompClient) {
		var now = new Date();
		var chatMessage = {
			user : curUserName,// XXX
			content : messageInput.value,
			type : 'CHAT',
			userId : curUserId,
			date : now.format("dd mmm HH:MM")
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
	if (curUserName == item.user) {
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
	userNameInBubble.innerHTML = item.user;
	userNameInBubble.setAttribute("id", "bubble-user");
	var bubbleMessage = document.createElement('p');
	bubbleMessage.textContent = item.content;
	bubbleMessage.setAttribute("id", "bubble-content");
	var bubbleTime = document.createElement('h5');
	bubbleTime.textContent = item.date;
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
	if (message.type === 'JOIN' && message.user != curUserName) {
		var newUser = document.createElement('li');
		newUser.setAttribute('value', message.user)
		newUser.innerHTML = message.user;
		userArea.appendChild(newUser);
		$('#userAct').html(message.user + " online ")
		$('#leaveJoinForm').css('display', 'block').animate({
			opacity : 1,
			top : '80%'
		}, 200);
		setTimeout(func, 2000)
		function func() {
			$('#leaveJoinForm').animate({
				opacity : 0,
				top : '80%'
			}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	} else if (message.type === 'UPLOAD' && message.user === curUserName) {
		var inMes = message.upd;
		var mes = inMes.data;
		inMes.data.forEach(function(item, i, arr) {
			showUploadedMessages(item);
		});
		inMes.users.forEach(function(item, i, arr) {
			showUploadedUsers(item);
		});
	} else if (message.type === 'CHAT') {
		var alDiv = document.createElement('div');
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
		bubbleTime.textContent = now.format("dd mmm HH:MM");
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
