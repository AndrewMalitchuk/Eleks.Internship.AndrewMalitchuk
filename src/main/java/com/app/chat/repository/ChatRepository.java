package com.app.chat.repository;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.app.chat.model.Message;
import com.app.chat.util.Constants;
import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.Statement;

@Repository
public class ChatRepository {

	@Value("${spring.datasource.url}")
	private String url;

	@Value("${spring.datasource.username}")
	private String user;

	@Value("${spring.datasource.password}")
	private String password;

	private Connection con = null;

	public void initialization() {
		try {
			Class.forName("com.mysql.jdbc.Driver");
			con = (Connection) DriverManager.getConnection(url, user, password);
		} catch (SQLException | ClassNotFoundException e) {
			e.printStackTrace();
		}
	}

	public boolean userExist(String username) {
		initialization();
		PreparedStatement prStmt = null;
		ResultSet rs;
		boolean res = true;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(Constants.userExistQuery);
			prStmt.setString(1, username);
			rs = prStmt.executeQuery();
			res = rs.next();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return res;
	}

	public boolean userActive(String username) {
		initialization();
		PreparedStatement prStmt = null;
		ResultSet rs;
		boolean res = true;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(Constants.userActiveQuery);
			prStmt.setString(1, username);
			rs = prStmt.executeQuery();
			res = rs.next();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return res;
	}

	public void setUserStatus(String username, String status) {
		initialization();
		PreparedStatement prStmt = null;
		try {
			if (status.equals("online"))
				prStmt = (PreparedStatement) con.prepareStatement(Constants.setOnlineQuery);
			else if (status.equals("offline"))
				prStmt = (PreparedStatement) con.prepareStatement(Constants.setOfflineQuery);
			prStmt.setString(1, username);
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public int userIdentification(String username, String password) {
		initialization();
		int id = -1;
		int count = 0;
		ResultSet rs;
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(Constants.userIdentificationQuery);
			prStmt.setString(1, username);
			prStmt.setString(2, password);
			rs = prStmt.executeQuery();
			while (rs.next()) {
				id = rs.getInt(1);
				count++;
			}
		} catch (SQLException ex) {
			ex.printStackTrace();
		}
		if (count > 1)
			id = -1;
		else if (id != -1)
			return id;
		return -1;
	}

	public void addMessage(Message message) {
		initialization();
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(Constants.addMessageQuery);
			prStmt.setString(1, message.getContent());
			prStmt.setString(2, message.getDate());
			prStmt.setInt(3, message.getUserId());
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public void addUser(String username, String password) {
		initialization();
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(Constants.addUserQuery);
			prStmt.setString(1, username);
			prStmt.setString(2, password);
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public ArrayList<Message> getMessagesForUpload() {
		initialization();
		ArrayList<Message> ls = new ArrayList<Message>();
		ResultSet rs;
		try {
			Statement stmt = (Statement) con.createStatement();
			stmt = (Statement) con.createStatement();
			rs = stmt.executeQuery(Constants.getMessagesForUploadQuery);
			while (rs.next()) {
				Message temp = new Message();
				temp.setUser(rs.getString(1));
				temp.setContent(rs.getString(2));
				temp.setDate(rs.getString(3));
				ls.add(temp);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return ls;
	}

	public ArrayList<String> getActiveUsersForUpload() {
		initialization();
		ArrayList<String> ls = new ArrayList<String>();
		ResultSet rs;
		try {
			Statement stmt = (Statement) con.createStatement();
			stmt = (Statement) con.createStatement();
			rs = stmt.executeQuery(Constants.getActiveUsersForUploadQuery);
			while (rs.next()) {
				String temp = rs.getString(1);
				ls.add(temp);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return ls;
	}

}
