package api

import (
	"database/sql"
	"dream_grarage_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id           int           `json:"id"`
	Username     string        `json:"username"`
	Email        string        `json:"email"`
	Password     string        `json:"password"`
	Points       string        `json:"points"`
	Last_Active  sql.NullTime  `json:"last_active"`
	Streak       int           `json:"streak"`
	DreamGarage  pq.Int64Array `json:"dream_garage" db:"dream_garage"`
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
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			if pqErr.Constraint == "users_username_key" {
				ResponseJSON(c, http.StatusConflict, "Username already taken", nil)
				return
			}
			if pqErr.Constraint == "users_email_key" {
				ResponseJSON(c, http.StatusConflict, "Email already taken", nil)
				return
			}
		}
		ResponseJSON(c, http.StatusInternalServerError, "Could not create user", nil)
		return
	}
	ResponseJSON(c, http.StatusOK, "User Created Successfully", id)

}

type PointsInput struct {
	Id     string
	Points string
	Streak string
}

func UpdateUserPoints(c *gin.Context) {
	var userParams PointsInput

	if err := c.ShouldBindJSON(&userParams); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	userId := userParams.Id
	userPoints := userParams.Points
	userStreak := userParams.Streak

	sqlStatement := `
		UPDATE users
		SET points = $2, last_active = NOW(), streak = $3
		WHERE id = $1
		RETURNING id, points, last_active, streak;`
	var id int
	var points int
	var streak int
	var last_active sql.NullTime

	err := db.Conn.QueryRowx(sqlStatement, userId, userPoints, userStreak).Scan(&id, &points, &last_active, &streak)
	if err != nil {
		panic(err)
	}

	ResponseJSON(c, http.StatusOK, "User Updated Successfully", gin.H{"id": id, "points": points, "last_active": last_active, "streak": streak})

}

func chargeUser(userId int, price int) {
	sqlStatement := `
		UPDATE users
		SET points = points - $2
		WHERE id = $1`

	db.Conn.Exec(sqlStatement, userId, price)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

type DreamGarageInput struct {
	Id      int   `json:"id"`
	CardIds []int `json:"cardIds"`
}

func GetDreamGarage(c *gin.Context) {
	var input IdInput

	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var dreamGarage pq.Int64Array
	err := db.Conn.QueryRowx("SELECT COALESCE(dream_garage, ARRAY[]::integer[]) FROM users WHERE id=$1", input.Id).Scan(&dreamGarage)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch dream garage", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Dream garage fetched", dreamGarage)
}

func UpdateDreamGarage(c *gin.Context) {
	var input DreamGarageInput

	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	if len(input.CardIds) > 5 {
		ResponseJSON(c, http.StatusBadRequest, "Dream garage can contain at most 5 cards", nil)
		return
	}

	_, err := db.Conn.Exec("UPDATE users SET dream_garage=$2 WHERE id=$1", input.Id, pq.Array(input.CardIds))
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not update dream garage", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Dream garage updated", input.CardIds)
}
