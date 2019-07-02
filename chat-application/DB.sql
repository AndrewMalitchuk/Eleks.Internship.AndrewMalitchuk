create database if not exists chatDB CHARACTER SET utf8;

drop database chatDB;

use chatDB;

CREATE TABLE users (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    userName VARCHAR(50) NOT NULL,
    userPassword VARCHAR(50) NOT NULL,
    userStatus ENUM('online', 'offline') NOT NULL
);

drop table users;


CREATE TABLE messages (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    content VARCHAR(256) NOT NULL,
    messTime VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId)
        REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

drop table messages;




