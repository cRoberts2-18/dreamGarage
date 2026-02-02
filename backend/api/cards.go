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
