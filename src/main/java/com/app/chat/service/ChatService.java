package com.app.chat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.app.chat.model.Message;
import com.app.chat.model.User;
import com.app.chat.repository.ChatRepository;

@Service
public class ChatService {

	@Autowired
	private SimpMessageSendingOperations messageTemplate;

	@Autowired
	ChatRepository repository;

	public User identifyUser(User user, SimpMessageHeaderAccessor headerAccessor) {
		int id = repository.userIdentification(user.getName(), user.getPassword());
		if (id == -1) {
			user.setId(id);
			return user;
		} else {
			user.setId(id);
			repository.setUserStatus(user.getName(), "online");
			headerAccessor.getSessionAttributes().put("username", user.getName());
		}
		return user;
	}

	public User addNewUser(User user, SimpMessageHeaderAccessor headerAccessor) {
		if (!repository.userExist(user.getName())) {
			repository.addUser(user.getName(), user.getPassword());
			headerAccessor.getSessionAttributes().put("username", user.getName());
			return user;
		} else {
			user.setId(-3);
			return user;
		}
	}

	public Message saveMessage(Message message) {
		if (message.getType() == Message.MessageType.CHAT)
			repository.addMessage(message);
		return message;
	}

	public List<Message> getMessages() {
		List<Message> upl = new ArrayList<Message>();
		upl = repository.getMessagesForUpload();
		return upl;
	}

	public List<String> getUsers() {
		List<String> upl = new ArrayList<String>();
		upl = repository.getActiveUsersForUpload();
		return upl;
	}

	public void changeUserStatus(String username, String userstatus) {
		repository.setUserStatus(username, userstatus);
	}

	@EventListener
	public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		String username = (String) headerAccessor.getSessionAttributes().get("username");
		if (username != null) {
			User user = new User();
			user.setName(username);
			user.setId(-2);
			repository.setUserStatus(username, "offline");
			messageTemplate.convertAndSend("/channel/public", user);
		}
	}

}
