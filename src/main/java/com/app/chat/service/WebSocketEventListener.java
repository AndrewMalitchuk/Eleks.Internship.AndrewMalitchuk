package com.app.chat.service;

import com.app.chat.model.*;
import com.db.mysql.MySQL;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

	private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

	@Autowired
	private SimpMessageSendingOperations messageTemplate;

	@EventListener
	public void handleWebSocketConnectListener(SessionConnectedEvent event) {
		log.info("New WebSocket Connected");
	}

	@EventListener
	public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {

		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		String username = (String) headerAccessor.getSessionAttributes().get("username");
		if (username != null) {
			log.info("Disconnected : " + username);
			User user = new User();
			user.setName(username);
			user.setId(-2);
			MySQL mysql = new MySQL("jdbc:mysql://localhost:3306/chatDB", "root", "root");
			mysql.setOffline(username);
			messageTemplate.convertAndSend("/channel/public", user);
		}
	}
}
