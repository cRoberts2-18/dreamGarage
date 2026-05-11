package api

import (
	"dream_grarage_api/db"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RaceEvent struct {
	Id   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Type string `json:"type" db:"type"`
}

type OpponentResponse struct {
	Card       Card `json:"card"`
	Difficulty int  `json:"difficulty"`
}

func GetEvents(c *gin.Context) {
	events := []RaceEvent{}
	rows, err := db.Conn.Queryx("SELECT id, name, type FROM events ORDER BY id")
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch events", nil)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var e RaceEvent
		if err := rows.StructScan(&e); err != nil {
			continue
		}
		events = append(events, e)
	}

	ResponseJSON(c, http.StatusOK, "Events fetched", events)
}

func GetOpponent(c *gin.Context) {
	eventId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid event id", nil)
		return
	}

	var eventType string
	if err := db.Conn.QueryRowx("SELECT type FROM events WHERE id=$1", eventId).Scan(&eventType); err != nil {
		ResponseJSON(c, http.StatusNotFound, "Event not found", nil)
		return
	}

	cards := []Card{}
	rows, err := db.Conn.Queryx("SELECT * FROM cards")
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch cards", nil)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var card Card
		if err := rows.StructScan(&card); err != nil {
			continue
		}
		cards = append(cards, card)
	}

	if len(cards) == 0 {
		ResponseJSON(c, http.StatusNotFound, "No cards available", nil)
		return
	}

	opponent := cards[rand.Intn(len(cards))]

	opponentScore := raceScore(opponent, eventType)
	countBelow := 0
	for _, card := range cards {
		if raceScore(card, eventType) <= opponentScore {
			countBelow++
		}
	}
	percentile := float64(countBelow) / float64(len(cards))

	ResponseJSON(c, http.StatusOK, "Opponent fetched", OpponentResponse{
		Card:       opponent,
		Difficulty: percentileToDifficulty(percentile),
	})
}

func raceScore(card Card, eventType string) float64 {
	ts := float64(card.TopSpeed)
	hp := float64(card.Horsepower) / 10.0
	h := float64(card.Handling) * 20.0

	switch eventType {
	case "drag":
		return ts*0.55 + hp*0.45
	case "circuit":
		return ts*0.4 + hp*0.3 + h*0.3
	default: // rally
		return ts*0.35 + hp*0.3 + h*0.35
	}
}

func percentileToDifficulty(p float64) int {
	switch {
	case p >= 0.80:
		return 5
	case p >= 0.60:
		return 4
	case p >= 0.40:
		return 3
	case p >= 0.20:
		return 2
	default:
		return 1
	}
}
