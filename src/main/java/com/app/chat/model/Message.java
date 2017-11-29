package com.app.chat.model;

import java.util.List;

public class Message {
	
	private int userId;
	
	
    private String content;
    private String user;
	private MessageType type;
	public List<Message>data;
	
	public UpdateMessages upd;
	
	
	// TODO: email
    
    public enum MessageType{ 
    	CHAT,
        JOIN,
        LEAVE,
        UPLOAD
    }
    
    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
    
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}
