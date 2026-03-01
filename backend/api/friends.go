package api

import (
	"database/sql"
	"dream_grarage_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type FriendRequestInput struct {
	UserId         int    `json:"userId"`
	TargetUsername string `json:"targetUsername"`
}

type FriendActionInput struct {
	UserId int    `json:"userId"`
	Action string `json:"action"`
}

type FriendIdInput struct {
	UserId int `json:"userId"`
}

type FriendInfo struct {
	FriendshipId int    `json:"friendshipId" db:"friendship_id"`
	FriendId     int    `json:"friendId" db:"friend_id"`
	AddresseeUsername     string `json:"addresseeUsername" db:"addressee_username"`
	RequesterUsername     string `json:"requesterUsername" db:"requester_username"`
	Username	string `json:"username" db:"username"`
	Status       string `json:"status" db:"status"`
}

func SendFriendRequest(c *gin.Context) {
	var input FriendRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var targetId int
	err := db.Conn.QueryRowx("SELECT id FROM users WHERE username=$1", input.TargetUsername).Scan(&targetId)
	if err == sql.ErrNoRows {
		ResponseJSON(c, http.StatusNotFound, "User not found", nil)
		return
	}
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not find user", nil)
		return
	}

	if targetId == input.UserId {
		ResponseJSON(c, http.StatusBadRequest, "Cannot send friend request to yourself", nil)
		return
	}

	var existingCount int
	err = db.Conn.QueryRowx(`
		SELECT COUNT(*) FROM friendships
		WHERE (requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1)`,
		input.UserId, targetId).Scan(&existingCount)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not send friend request", nil)
		return
	}
	if existingCount > 0 {
		ResponseJSON(c, http.StatusConflict, "Friend request already exists or you are already friends", nil)
		return
	}

	_, err = db.Conn.Exec(`
		INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1, $2, 'pending')`,
		input.UserId, targetId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not send friend request", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Friend request sent", nil)
}

func GetFriendRequests(c *gin.Context) {
	var input FriendIdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	rows, err := db.Conn.Queryx(`
		SELECT f.id as friendship_id, ru.id as friend_id, ru.username as requester_username, au.username as addressee_username, f.status
		FROM friendships f
		JOIN users ru ON ru.id = f.requester_id
		JOIN users au ON au.id = f.addressee_id
		WHERE (f.addressee_id=$1 OR f.requester_id=$1) AND f.status='pending'`,
		input.UserId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch friend requests", nil)
		return
	}
	defer rows.Close()

	requests := []FriendInfo{}
	for rows.Next() {
		var req FriendInfo
		if err := rows.StructScan(&req); err != nil {
			continue
		}
		requests = append(requests, req)
	}

	ResponseJSON(c, http.StatusOK, "Friend requests fetched", requests)
}

func RespondToFriendRequest(c *gin.Context) {
	friendshipId := c.Param("id")
	var input FriendActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	if input.Action == "accept" {
		_, err := db.Conn.Exec(`
			UPDATE friendships SET status='accepted'
			WHERE id=$1 AND status='pending'`,
			friendshipId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not accept friend request", nil)
			return
		}
		ResponseJSON(c, http.StatusOK, "Friend request accepted", nil)
	} else if input.Action == "reject" {
		_, err := db.Conn.Exec(`
			DELETE FROM friendships
			WHERE id=$1 AND status='pending'`,
			friendshipId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not reject friend request", nil)
			return
		}
		ResponseJSON(c, http.StatusOK, "Friend request rejected", nil)
	} else {
		ResponseJSON(c, http.StatusBadRequest, "Invalid action", nil)
	}
}

func GetFriends(c *gin.Context) {
	var input FriendIdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	rows, err := db.Conn.Queryx(`
		SELECT
			f.id as friendship_id,
			CASE WHEN f.requester_id=$1 THEN f.addressee_id ELSE f.requester_id END as friend_id,
			CASE WHEN f.requester_id=$1 THEN ua.username ELSE ur.username END as username,
			f.status
		FROM friendships f
		JOIN users ur ON ur.id = f.requester_id
		JOIN users ua ON ua.id = f.addressee_id
		WHERE (f.requester_id=$1 OR f.addressee_id=$1) AND f.status='accepted'`,
		input.UserId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch friends", nil)
		return
	}
	defer rows.Close()

	friends := []FriendInfo{}
	for rows.Next() {
		var friend FriendInfo
		if err := rows.StructScan(&friend); err != nil {
			continue
		}
		friends = append(friends, friend)
	}

	ResponseJSON(c, http.StatusOK, "Friends fetched", friends)
}

func RemoveFriend(c *gin.Context) {
	friendshipId := c.Param("id")
	var input FriendIdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	_, err := db.Conn.Exec(`
		DELETE FROM friendships
		WHERE id=$1 AND (requester_id=$2 OR addressee_id=$2) AND status='accepted'`,
		friendshipId, input.UserId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not remove friend", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Friend removed", nil)
}

func GetFriendDreamGarage(c *gin.Context) {
	friendId := c.Param("friendId")
	var input FriendIdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var friendshipCount int
	err := db.Conn.QueryRowx(`
		SELECT COUNT(*) FROM friendships
		WHERE ((requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1))
		AND status='accepted'`,
		input.UserId, friendId).Scan(&friendshipCount)
	if err != nil || friendshipCount == 0 {
		ResponseJSON(c, http.StatusForbidden, "Not friends with this user", nil)
		return
	}

	var dreamGarage pq.Int64Array
	var username string
	err = db.Conn.QueryRowx(
		"SELECT COALESCE(dream_garage, ARRAY[]::integer[]), username FROM users WHERE id=$1",
		friendId).Scan(&dreamGarage, &username)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch dream garage", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Friend dream garage fetched", gin.H{"dreamGarage": dreamGarage, "username": username})
}
