package api

import (
	"dream_grarage_api/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SaveRaceInput struct {
	UserId         int     `json:"userId"`
	EventId        int     `json:"eventId"`
	UserCardId     int     `json:"userCardId"`
	OpponentCardId int     `json:"opponentCardId"`
	Result         string  `json:"result"`
	UserTime       float64 `json:"userTime"`
	OpponentTime   float64 `json:"opponentTime"`
}

func SaveRace(c *gin.Context) {
	var input SaveRaceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var id int
	err := db.Conn.QueryRowx(`
		INSERT INTO races (user_id, event_id, user_card_id, opponent_card_id, result, user_time, opponent_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`,
		input.UserId, input.EventId, input.UserCardId, input.OpponentCardId,
		input.Result, input.UserTime, input.OpponentTime,
	).Scan(&id)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not save race", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Race saved", gin.H{"id": id})
}
