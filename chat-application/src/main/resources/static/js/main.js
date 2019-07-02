'use strict';

// елементи сторінки
var loginPage = document.querySelector('#loginPage');
var chatPage = document.querySelector('#chatPage');
var logInForm = document.querySelector('#logInForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var userArea = document.querySelector('#userArea');
var checkInPage = document.querySelector('#checkInPage');
var checkInForm = document.querySelector("#checkInForm");

var stompClient = null;

// логін користувача та його id
var curUserName;
var curUserId;

// завантаження даних - повідомлення, користувачі
var dataStatus = false;
var dataUpload = false;
var userUpload = false;

// перехід на форму реєстрації
$('#registryLink').click(function() {
	loginPage.classList.add('hidden');
	checkInPage.classList.remove('hidden');
	$('#name,#pass').val("")
})

// зміна кольору посилань на форми
$('#registryLink,#returnLogin').mouseover(function() {
	$(this).css('cursor', 'pointer');
	$(this).css('color', '#2196F3');
}).mouseout(function() {
	$(this).css('color', 'black');
});

// повернення на форму входу
$('#returnLogin').click(function() {
	if (stompClient != null)
		location.reload()
	checkInPage.classList.add('hidden');
	loginPage.classList.remove('hidden');
	$('#newUserName,#firstPass,#secondPass').val("")
})

// пошук
$('#search').click(function() {
	var searchVal = $('.searchBoxInput').val();
	var count = 0;
	var arr = [];
	if (searchVal != '') {
		var mes = $('.talktext')
		for (var i = 0; i < mes.length; i++) {
			var mesEl = mes[i].children;
			var reg = new RegExp('([\w]*' + searchVal + '[\w]*)', 'gm')
			if (mesEl[1].innerHTML.match(reg) != null) {
				arr.push(mes[i])
				count++;
			}
		}
		if (count == 0) {
			$('#searchResFail').css('display', 'block').animate({
				opacity : 1
			}, 200);
			setTimeout(function() {
				$('#searchResFail').animate({
					opacity : 0,
				}, 200, function() {
					$(this).css('display', 'none');
				});
			}, 2000)
		} else {
			$('#searchRes').css('display', 'block').animate({
				opacity : 1
			}, 200);
			$('#searchResId').val('0' + "/" + count)
			var i = 0;
			$('#leftBut').click(function() {
				i--;
				if (i < 0)
					i = count - 1;
				arr[i].scrollIntoView();
				arr[i].setAttribute('style', 'color:red')
				$('#searchResId').val(i + 1 + "/" + count)
			})
			$('#rightBut').click(function() {
				i++;
				if (i == count)
					i = 0;
				arr[i].scrollIntoView();
				arr[i].setAttribute('style', 'color:red')
				$('#searchResId').val(i + 1 + "/" + count)
			})
		}
	}
	$('.searchBoxInput').val('')
});

// закриття пошуку
$("#closeSearch").click(function() {
	$('#searchRes').css('display', 'none').animate({
		opacity : 1
	}, 200);
	var mes = $('.talktext')
	for (var i = 0; i < mes.length; i++)
		mes[i].setAttribute('style', 'color:black')
});

// логін та пас
var username;
var pass;

// створення користувача - т.е. регістрація
function createUser(event) {
	var newUser = document.getElementById('newUserName').value;
	curUserName = document.getElementById('newUserName').value;
	var firstPass = document.getElementById('firstPass').value;
	var secondPass = document.getElementById('secondPass').value;
	if (newUser) {
		if (firstPass === secondPass && firstPass != '') {
			loginPage.classList.add('hidden');
			var socket = new SockJS('/ws');
			stompClient = Stomp.over(socket);
			stompClient.connect({}, onCreated, onError);
			event.preventDefault();
			pass = document.getElementById('firstPass').value;
		} else {

		}
	} else {
		// alert('login')
	}
}

function onCreated() {
	var newUser = {
		name : curUserName,
		password : pass
	};
	stompClient.send("/app/chat/createUser", {}, JSON.stringify(newUser));
	stompClient.subscribe('/channel/public', onUserReceived);
}

function onUserReceived(payload) {
	var user = JSON.parse(payload.body);
	if (user.name == curUserName) {
		if (curUserId != undefined) {
			if (user.id == -1) {
				var now = new Date();
				user.id = curUserId;
			}
		}
	}
	if (user.id != -3 && user.id != -1 && curUserName != null) {
		$('#overlay').fadeIn(400, function() {
			$('#popUpCheckInSuccess').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("#popUpCheckInSuccessOkButton").click(function() {
			location.reload();
		});
		$('#popUpCheckInSuccessUserName').html(curUserName);
		loginPage.classList.add('hidden');
		chatPage.classList.add('hidden');
	} else if (user.name == curUserName && curUserId == undefined) {
		$('#overlay').fadeIn(400, function() {
			$('#popUpCheckInFail').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("#popUpCheckInFailOkButton").click(function() {
			$('#popUpCheckInFail').animate({
				opacity : 0,
				top : '45%'
			}, 200, function() {
				$(this).css('display', 'none');
				$('#overlay').fadeOut(400);
			});
			$('#newUserName,#firstPass,#secondPass').val("")

		});
	}
	user.name = null;
	curUserName = null;
	user.id = null;
}

// підєднання користувача - т.е. вхід
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
		name : document.querySelector('#name').value.trim(),
		password : document.getElementById('pass').value
	};
	stompClient.send("/app/chat/addUserToChat", {}, JSON.stringify(newUser));
	var temp = stompClient.subscribe('/channel/public', onUserConnected,
			onError);
}

function onUserConnected(payload) {
	var user = JSON.parse(payload.body);
	if (user.id > 0 && user.name == curUserName) {
		curUserId = user.id;
	}
	if (user.name == curUserName) {
		if (curUserId != undefined) {
			if (user.id < 0) {
				var now = new Date();
				user.id = curUserId;
			}
		}
	}
	if (user.id == -2 && user.id != -1 && user.id != -3) {
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
	if (user.id == -1 && user.name == curUserName) {
		$('#overlay').fadeIn(400, function() {
			$('#popUpLogInFail').css('display', 'block').animate({
				opacity : 1,
				top : '50%'
			}, 200);
		});
		$("#popUpLoginFailButton").click(function() {
			$('#popUpLogInFail').animate({
				opacity : 0,
				top : '45%'
			}, 200, function() {
				$(this).css('display', 'none');
				$('#overlay').fadeOut(400);
			});
			$('#name,#pass').val("")
			curUserName = null;
			curUserId = null;
		});
	} else if (user.name == curUserName && user.id > 0) {
		if (dataStatus == false) {
			stompClient.subscribe('/channel/public/data', onMessageReceived);
			stompClient.subscribe('/channel/public/uploadMessages',
					onUploadData);
			stompClient.subscribe('/channel/public/uploadUsers', onUploadUser);
			loginPage.classList.add('hidden');
			checkInPage.classList.add('hidden');
			chatPage.classList.remove('hidden');
			connectingElement.classList.add('hidden');
			stompClient.send("/app/chat/sendMessage", {}, JSON.stringify({
				user : user.name,
				type : 'JOIN'
			}))
			var uploadMessage = {
				user : curUserName,
				type : "UPLOAD"
			};
			stompClient.send("/app/chat/uploadMessages", {}, JSON
					.stringify(uploadMessage));
			stompClient.send("/app/chat/uploadUsers", {}, JSON
					.stringify(uploadMessage));
			event.preventDefault();
			dataStatus = true;
		}
	}
}

// при помилці
function onError(payload) {
	$('#overlay').fadeIn(400, function() {
		$('#popUpError').css('display', 'block').animate({
			opacity : 1,
			top : '50%'
		}, 200);
	});
	$("[id='popUpErrorOkButton']").click(function() {
		$('#popUpError').animate({
			opacity : 0,
			top : '45%'
		}, 200, function() {
			$(this).css('display', 'none');
			$('#overlay').fadeOut(400);
		});

	});
}

// відправка повідомлень
function sendMessage(event) {
	var messageContent = messageInput.value.trim();
	if (messageContent && stompClient) {
		var now = new Date();
		var chatMessage = {
			user : curUserName,
			content : messageInput.value,
			type : 'CHAT',
			userId : curUserId,
			date : now.format("dd mmm HH:MM")
		};
		stompClient.send("/app/chat/sendMessage", {}, JSON
				.stringify(chatMessage));
		messageInput.value = '';
	}
	event.preventDefault();
}

// відображення повідомлень завантажених з сервера
function showUploadedMessages(item) {
	var messageElement = document.createElement('li');
	var alDiv = document.createElement('div');
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
	talktext.setAttribute("ondblclick", "getQuote(this);");
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

// відображення користувач завантажених з сервера
function showUploadedUsers(item) {
	var newUser = document.createElement('li');
	newUser.setAttribute('value', item)
	var userBox = document.createElement('div');
	userBox.setAttribute('id', 'userBox')
	if (item == curUserName)
		newUser.setAttribute('id', 'curUser')
	newUser.appendChild(userBox);
	userBox.innerHTML = item
	userArea.appendChild(newUser);
}

// завантаження повідомлень
function onUploadData(payload) {
	if (dataUpload == false) {
		var upl = JSON.parse(payload.body);
		upl.forEach(function(item, i, arr) {
			showUploadedMessages(item);
		});
		dataUpload = true;
	}
}

// завантаження користувачів
function onUploadUser(payload) {
	if (userUpload == false) {
		var upl = JSON.parse(payload.body);
		upl.forEach(function(item, i, arr) {
			showUploadedUsers(item);
		});
		userUpload = true;
	}
}

// отримання повідомлень
function onMessageReceived(payload) {
	var message = JSON.parse(payload.body);
	var messageElement = document.createElement('li');
	if (message.type === 'JOIN' && message.user != curUserName) {
		var newUser = document.createElement('li');
		newUser.setAttribute('value', message.user)
		var userBox = document.createElement('div');
		userBox.setAttribute('id', 'userBox')
		newUser.appendChild(userBox);
		userBox.innerHTML = message.user
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
		talktext.setAttribute("ondblclick", "getQuote(this);");
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

// отримання цитати повідомлення для "пересилання"
function getQuote(val) {
	var a = val.children;
	var quote = a[0].innerHTML + ": " + a[1].innerHTML + " [" + a[2].innerHTML
			+ "]";
	$('#message').val(quote)
}

// слухачі
logInForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
checkInForm.addEventListener('submit', createUser, true)