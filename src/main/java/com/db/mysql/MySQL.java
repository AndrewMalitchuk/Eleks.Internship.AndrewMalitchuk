package com.db.mysql;

import java.sql.DriverManager;
import java.sql.SQLException;

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
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void executeDataQuery(Query query) {
		PreparedStatement prStmt=null;
		try {
			prStmt = (PreparedStatement) con.prepareStatement(query.toString());
			prStmt.execute();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
