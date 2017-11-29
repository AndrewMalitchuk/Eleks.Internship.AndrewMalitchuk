package com.app.chat.conroller;

import com.app.chat.model.Message;
import com.app.chat.model.UpdateMessages;
import com.app.chat.model.User;
import  com.db.mysql.*;
import com.app.chat.*;

import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
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
	
    public Message addUser(@Payload Message message, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message.getUser());
        
        /*
        User user=new User();
        user.setName(message.getUser());
        user.setEmail("test");
        
        mysql.executeDataQuery(new Query("insert into `users` (username,email) values ('#','#')",user.getName(),user.getEmail()));
        */
        
        //новий корисутвач
        System.out.println("#accessed: "+message.getUser()+" "+message.getType());
        return message;
    }
    
    @MessageMapping("/chat.createUser")
    @SendTo("/channel/public")
    
    public User createUser(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    	headerAccessor.getSessionAttributes().put("username", user.getName());
    	System.out.println("bef qu");
  
    	mysql.executeDataQuery(new Query("insert into `users` (userName,userPassword) values ('#','#')",user.getName(),user.getPassword()));
    	System.out.println("af qu");
        System.out.println("#create: "+user.getName()+" "+user.getPassword());
        
        return user;
    }
    
    
    
    @MessageMapping("/chat.sendMessage")
    @SendTo("/channel/public")
    public Message sendMessage(@Payload Message message) {
    	//отримання повідомлення
    	System.out.println("#send: "+message.getUser()+" "+message.getContent()+" "+message.getType());
    	
    	// mysql.executeDataQuery(new Query("insert into messages (userId,content,timeValue) value (#,'#','2017-11-27 16:21');",user.getName(),user.getEmail()));
    	
        return message;
    }
    
    //XXX
    @MessageMapping("/chat.uploadData")
    @SendTo("/channel/public")
    public Message uploadData(@Payload Message message) {
    	System.out.println("#upload: "+" "+message.getUser());
    	//message.setContent("#upload#");
    	///////////////////////////////////
	    	List<Message> upload=new ArrayList<Message>();
	    	Message m1=new Message();
	    	m1.setContent("CONTENT1");
	    	m1.setUser("USER1");
	    	upload.add(m1);
	    	Message m2=new Message();
	    	m2.setContent("CONTENT2");
	    	m2.setUser("USER2");  
	    	upload.add(m2);
    	////////////////////////////////////////////
    	message.data=new ArrayList<Message>();
    	
    	message.data=upload;
    	///////////////////////////////////////////////
    	
    	/////////////////////////////////////////////////
    	
    	message.upd=new UpdateMessages();
    	
    	message.upd.data=new ArrayList<Message>();
    	
    	/*
    	message.upd=new UpdateMessages();
    	message.upd.setData(upload);
    	*/
    	message.upd.data=upload;
    	
    	message.upd.users=new ArrayList<String>();
    	message.upd.users.add("KEK1");
    	message.upd.users.add("KEK2");
    	////////////////////////////////////////////////////
    	return message;
    	
    }
    
}