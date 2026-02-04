package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"dream_grarage_api/db"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string
	Password string
}


func GenerateJWT(c *gin.Context) {
	var loginRequest LoginRequest
	var user User

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	row := db.Conn.QueryRowx("SELECT * FROM users WHERE username=$1", loginRequest.Username)

	err := row.StructScan(&user)
	fmt.Println(err)
	switch err {
	case sql.ErrNoRows:
		ResponseJSON(c, http.StatusNotFound, "User not found", nil)
		return
	case nil:
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password))
		if err == nil {
			expirationTime := time.Now().Add(15 * time.Minute)
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"exp": expirationTime.Unix(),
				"userID": user.Id,
			})
			// Sign the token
			tokenString, err := token.SignedString(jwtSecret)
			if err != nil {
				ResponseJSON(c, http.StatusInternalServerError, "Could not generate token", nil)
				return
			}
		
			UpdateUserLastActive(user.Id)
			ResponseJSON(c, http.StatusOK, "Token generated successfully", gin.H{"token": tokenString, "user": user})
		} else {
			ResponseJSON(c, http.StatusUnauthorized, "Invalid credentials", nil)
		}

	default:
		ResponseJSON(c, http.StatusInternalServerError, "Could not generate token", nil)
		return
	}
}
