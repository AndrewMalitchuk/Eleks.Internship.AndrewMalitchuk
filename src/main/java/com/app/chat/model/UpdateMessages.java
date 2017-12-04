package com.app.chat.model;

import java.util.ArrayList;
import java.util.List;

public class UpdateMessages {

	public List<Message> data;
	public List<String> users;

	public void setData(List<Message> dataVal) {
		data = new ArrayList<Message>();
		data = dataVal;
	}
}
