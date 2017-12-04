package com.app.chat.conroller;

import com.app.chat.model.Message;
import com.app.chat.model.UpdateMessages;
import com.app.chat.model.User;
import  com.db.mysql.*;

import java.util.ArrayList;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
	
	MySQL mysql=new MySQL("jdbc:mysql://localhost:3306/chatDB","root","root");

    @MessageMapping("/chat.addUser") 
    @SendTo("/channel/public")
    public User addUser(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    	int id=mysql.userIdentification(user.getName(), user.getPassword());
    	if(id==-1) {
    		user.setId(id);
    		return user;
    	}
    	else {
    		user.setId(id);
    		mysql.setOnline(user.getName());
    		headerAccessor.getSessionAttributes().put("username", user.getName());//TODO: getName()→getId() 
    	}
    	return user;
    }

    @MessageMapping("/chat.createUser")
    @SendTo("/channel/public")
    public User createUser(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    	headerAccessor.getSessionAttributes().put("username", user.getName());
    	if(!mysql.userExist(user.getName())) { 
	    	mysql.executeDataQuery(new Query("insert into `users` (userName,userPassword,userStatus) values ('#','#','offline')",user.getName(),user.getPassword()));
	        headerAccessor.getSessionAttributes().put("username", user.getName());
	        return user;
    	}
    	else{
    		user.setId(-1);
    		return user;
    	}
    }
    
    
    
    @MessageMapping("/chat.sendMessage")
    @SendTo("/channel/public/data")
    public Message sendMessage(@Payload Message message) {
    	mysql.addMessage(message);
        return message;
    }
    

    @MessageMapping("/chat.uploadData")
    @SendTo("/channel/public/data")
    public Message uploadData(@Payload Message message) {
    	
    	if(message.getType().toString().equals("UPLOAD")) {

    	message.upd=new UpdateMessages();
    	message.upd.data=new ArrayList<Message>();
    	message.upd.data=mysql.getMessagesForUpload();
    	
    	message.upd.users=new ArrayList<String>();
    	message.upd.users=mysql.getActiveUsersForUpload();
    	
    	return message;
    	}
    	else 
    		return message;
    	
    		
    }
    	
    
    
}