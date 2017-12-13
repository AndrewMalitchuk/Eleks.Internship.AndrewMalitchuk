package com.app.util;

public class Constants {

	public final static String userExistQuery = "select * from `users` where `userName`=?";
	public final static String userActiveQuery = "select * from `users` where `userName`=? and `userStatus`='online'";
	public final static String setOnlineQuery = "update `users` set `userStatus`='online' where `userName`=?";
	public final static String setOfflineQuery = "update `users` set `userStatus`='offline' where `userName`=?";
	public final static String userIdentificationQuery = "select id from `users` where `userName`=? AND `userPassword`=? AND `userStatus`='offline'";
	public final static String addMessageQuery = "insert into `messages` (`content`,`messTime`,`userId`) values (?,?,?)";
	public final static String addUserQuery = "insert into `users` (userName,userPassword,userStatus) values (?,?,'offline')";
	public final static String getMessagesForUploadQuery = "select `users`.`userName`, `messages`.`content`,`messages`.`messTime` "
			+ "from messages inner join users on `users`.`id` = `messages`.`userId` order by `messages`.`messTime` asc";
	public final static String getActiveUsersForUploadQuery = "select `username` from `users` where `userStatus`='online'";
	
}
