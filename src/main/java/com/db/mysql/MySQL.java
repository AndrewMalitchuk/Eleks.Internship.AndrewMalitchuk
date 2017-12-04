package com.db.mysql;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import com.app.chat.model.Message;
import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.Statement;

public class MySQL {

	private Connection con = null;
	private Statement stmt = null;

	public MySQL(String hostPort, String user, String password) {
		String url = hostPort;
		try {
			Class.forName("com.mysql.jdbc.Driver");
			con = (Connection) DriverManager.getConnection(url, user, password);
			stmt = (Statement) con.createStatement();
		} catch (SQLException | ClassNotFoundException e) {
			e.printStackTrace();
		}
	}

	public void executeDataQuery(Query query) {
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(query.toString());
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public boolean userExist(String username) {
		ResultSet rs;
		int count = 0;
		try {
			rs = stmt.executeQuery("select * from `users` where `userName`='" + username + "'");
			while (rs.next())
				count++;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		if (count > 0)
			return true;
		else
			return false;
	}

	public boolean userActive(String username) {
		ResultSet rs;
		int count = 0;
		try {
			rs = stmt.executeQuery(
					"select * from `users` where `userName`='" + username + "' and `userStatus`='online'");
			while (rs.next())
				count++;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		if (count > 0)
			return true;
		else
			return false;
	}

	public void setOnline(String username) {
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con
					.prepareStatement("update `users` set `userStatus`='online' where `userName`='" + username + "'");
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public void setOffline(String username) {
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con
					.prepareStatement("update `users` set `userStatus`='offline' where `userName`='" + username + "'");
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public int userIdentification(String username, String password) {

		int id = -1;
		int count = 0;
		ResultSet rs;
		try {
			rs = stmt.executeQuery("select id from `users` where `userName`='" + username + "' AND `userPassword`='"
					+ password + "' AND `userStatus`='offline'");
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
		PreparedStatement prStmt = null;
		try {
			prStmt = (PreparedStatement) con
					.prepareStatement("insert into `messages` (`content`,`messTime`,`userId`) values (?,?,?)");
			prStmt.setString(1, message.getContent());
			prStmt.setString(2, message.getDate());
			prStmt.setInt(3, message.getUserId());
			prStmt.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public ArrayList<Message> getMessagesForUpload() {
		ArrayList<Message> ls = new ArrayList<Message>();
		ResultSet rs;
		try {
			stmt = (Statement) con.createStatement();
			rs = stmt.executeQuery(
					"select `users`.`userName`, `messages`.`content`,`messages`.`messTime` from messages inner join users on `users`.`id` = `messages`.`userId`"
							+ " order by `messages`.`messTime` asc");
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
		ArrayList<String> ls = new ArrayList<String>();
		ResultSet rs;
		try {
			stmt = (Statement) con.createStatement();
			rs = stmt.executeQuery("select `username` from `users` where `userStatus`='online'");
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
