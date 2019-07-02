package com.app.chat.conroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.app.chat.model.Message;
import com.app.chat.model.User;
import com.app.chat.service.ChatService;

@Controller
public class ChatController {

	@Autowired
	ChatService service;

	@MessageMapping("/chat/addUserToChat")
	@SendTo("/channel/public")
	public User addUserToChat(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
		return service.identifyUser(user, headerAccessor);
	}

	@MessageMapping("/chat/createUser")
	@SendTo("/channel/public")
	public User createUser(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
		return service.addNewUser(user, headerAccessor);
	}

	@MessageMapping("/chat/sendMessage")
	@SendTo("/channel/public/data")
	public Message sendMessage(@Payload Message message) {
		if (message.getType() == Message.MessageType.CHAT)
			service.saveMessage(message);
		return message;
	}

	@MessageMapping("/chat/uploadMessages")
	@SendTo("/channel/public/uploadMessages")
	public List<Message> uploadMessages(@Payload Message message) {
		if (message.getType() == Message.MessageType.UPLOAD)
			return service.getMessages();
		else
			return null;
	}

	@MessageMapping("/chat/uploadUsers")
	@SendTo("/channel/public/uploadUsers")
	public List<String> uploadUsers(@Payload Message message) {
		if (message.getType() == Message.MessageType.UPLOAD)
			return service.getUsers();
		else
			return null;
	}

}