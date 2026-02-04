package api

import (
	"dream_grarage_api/db"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id          int       `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password    string    `json:"password"`
	Points      string    `json:"points"`
	Last_Active time.Time `json:"last_active"`
	Streak      int       `json:"streak"`
}

type UserInput struct {
	Username string
	Password string
	Email    string
}

func InsertUser(c *gin.Context) {
	var userParams UserInput

	if err := c.ShouldBindJSON(&userParams); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	username := userParams.Username
	email := userParams.Email
	password := userParams.Password
	password, err := HashPassword(password)

	if err != nil {
		ResponseJSON(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	sqlStatement := `
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING id`
	id := 0
	err = db.Conn.QueryRowx(sqlStatement, username, email, password).Scan(&id)
	if err != nil {
		panic(err)
	}
	ResponseJSON(c, http.StatusOK, "User Created Successfully", id)

}

type PointsInput struct {
	Id     string
	Points string
}

func UpdateUserPoints(c *gin.Context) {
	var userParams PointsInput

	if err := c.ShouldBindJSON(&userParams); err != nil {
		fmt.Println(err)
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	userId := userParams.Id
	userPoints := userParams.Points

	sqlStatement := `
		UPDATE users
		SET points = $2, last_active = NOW()
		WHERE id = $1
		RETURNING id, points, last_active;`
	var id int
	var points int
	var last_active time.Time

	err := db.Conn.QueryRowx(sqlStatement, userId, userPoints).Scan(&id, &points, &last_active)
	if err != nil {
		panic(err)
	}

	ResponseJSON(c, http.StatusOK, "User Updated Successfully", gin.H{"id": id, "points": points, "last_active": last_active})

}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func UpdateUserLastActive(userId int) {
	sqlStatement := `
		UPDATE users
		SET last_active = NOW()
		WHERE id = $1`
	_, err := db.Conn.Exec(sqlStatement, userId)
	if err != nil {
		panic(err)
	}
}
