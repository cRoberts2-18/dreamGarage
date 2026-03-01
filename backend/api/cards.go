package api

import (
	"database/sql"
	"dream_grarage_api/db"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Card struct {
	Name       string `json:"name"`
	Image      string `json:"image"`
	Rating     string `json:"rating"`
	TopSpeed   int    `json:"topSpeed"`
	Horsepower int    `json:"horsepower"`
	Handling   int    `json:"handling"`
	Engine     string `json:"engine"`
	PackId     int    `json:"packId"`
	Id         int    `json:"id"`
	PackWeight int    `json:"packWeight"`
}

func GetCards(c *gin.Context) {
	cards := []Card{}

	rows, err := db.Conn.Queryx("SELECT * FROM cards")
	if err != nil {
		panic(err)
	}
	for rows.Next() {
		var card Card
		if err := rows.StructScan(&card); err != nil {
			panic(err)
		}
		cards = append(cards, card)
	}
	ResponseJSON(c, http.StatusOK, "Cards retrieved successfully", cards)
}

func GetUserOwnedCards(c *gin.Context) {
	var input IdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	var cardIds []int
	rows, queryErr := db.Conn.Queryx("SELECT card_id FROM user_cards WHERE user_id = $1", input.Id)

	if queryErr != nil {
		ResponseJSON(c, http.StatusNotFound, "Invalid Params", queryErr)
	}
	for rows.Next() {
		var cardId int
		if err := rows.Scan(&cardId); err != nil {
			ResponseJSON(c, http.StatusBadRequest, "An unknown error occured", nil)
		}
		cardIds = append(cardIds, cardId)
	}
	ResponseJSON(c, http.StatusOK, "Cards retrieved successfully", cardIds)

}

var ratingPrice = map[string]int{
	"S+": 2500,
	"S":  1000,
	"A":  500,
	"B":  200,
	"C":  75,
}

type SellCardInput struct {
	UserId   int
	CardId   int
	Quantity int
}

func SellCard(c *gin.Context) {
	var input SellCardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}
	if input.Quantity < 1 {
		input.Quantity = 1
	}

	var rating string
	if err := db.Conn.QueryRow("SELECT rating FROM cards WHERE id=$1", input.CardId).Scan(&rating); err != nil {
		ResponseJSON(c, http.StatusNotFound, "Card not found", nil)
		return
	}

	_, err := db.Conn.Exec(`
		DELETE FROM user_cards
		WHERE id IN (
			SELECT id FROM user_cards
			WHERE user_id = $1 AND card_id = $2
			LIMIT $3
		)
	`, input.UserId, input.CardId, input.Quantity)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Failed to sell card", nil)
		return
	}

	totalEarned := ratingPrice[rating] * input.Quantity
	var newPoints int
	if err := db.Conn.QueryRow(
		"UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points",
		totalEarned, input.UserId,
	).Scan(&newPoints); err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Failed to update points", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Card sold successfully", gin.H{"points": newPoints, "pointsEarned": totalEarned})
}

func GetCard(c *gin.Context) {
	cardId, err := strconv.Atoi(c.Param("id"))
	if err == nil {

		var card Card

		row := db.Conn.QueryRowx("SELECT * FROM cards WHERE id=$1", cardId)
		switch err := row.StructScan(&card); err {
		case sql.ErrNoRows:
			ResponseJSON(c, http.StatusNotFound, "Card not found", nil)
		case nil:
			ResponseJSON(c, http.StatusOK, "Card retrieved successfully", card)
		default:
			panic(err)
		}
	} else {
		ResponseJSON(c, http.StatusNotFound, "Invalid Params", nil)
	}
}
