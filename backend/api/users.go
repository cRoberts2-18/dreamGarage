package api

import (
	"dream_grarage_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
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

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}
