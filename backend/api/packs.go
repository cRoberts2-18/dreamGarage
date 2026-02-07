package api

import (
	"database/sql"
	"dream_grarage_api/db"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pack struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Image    string `json:"image"`
	Price    int    `json:"price"`
	Featured bool   `json:"featured"`
}

func GetPacks(c *gin.Context) {
	packs := []Pack{}

	rows, err := db.Conn.Queryx("SELECT * FROM packs")
	if err != nil {
		panic(err)
	}
	for rows.Next() {
		var pack Pack
		if err := rows.StructScan(&pack); err != nil {
			panic(err)
		}
		packs = append(packs, pack)
	}
	ResponseJSON(c, http.StatusOK, "packs retrieved successfully", packs)
}

func GetPack(c *gin.Context) {
	packId, err := strconv.Atoi(c.Param("id"))
	if err == nil {

		var pack Pack

		row := db.Conn.QueryRowx("SELECT * FROM packs WHERE id=$1", packId)
		switch err := row.StructScan(&pack); err {
		case sql.ErrNoRows:
			ResponseJSON(c, http.StatusNotFound, "pack not found", nil)
		case nil:
			ResponseJSON(c, http.StatusOK, "pack retrieved successfully", pack)
		default:
			panic(err)
		}
	} else {
		ResponseJSON(c, http.StatusNotFound, "Invalid Params", nil)
	}
}

type cardWeight struct {
	Id         int `json:"id"`
	PackWeight int `json:"packWeight"`
}

func PurchasePack(c *gin.Context) {
	var input IdInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	packId, err := strconv.Atoi(c.Param("id"))
	if err == nil {
		canAfford, price := _checkUserCanAffordPack(input.Id, packId)
		if canAfford {
			packContent := _generatePackContent(packId)
			chargeUser(input.Id, price)
			_saveUserNewCards(input.Id, packContent)

			ResponseJSON(c, http.StatusOK, "pack purchased successfully", packContent)
		} else {
			ResponseJSON(c, http.StatusOK, "Insufficient Points", nil)
		}

	} 
}

func _generatePackContent(packId int) []Card {
	var weightedCards []Card

	sqlStatement := "SELECT * FROM cards where packId=$1"
	rows, err := db.Conn.Queryx(sqlStatement, packId)
	if err != nil {
		panic(err)
	}
	for rows.Next() {
		var card Card
		if err := rows.StructScan(&card); err != nil {
			panic(err)
		}
		for i := 0; i < card.PackWeight; i++ {
			weightedCards = append(weightedCards, card)
		}

	}

	rand.Shuffle(len(weightedCards), func(i, j int) {
		weightedCards[i], weightedCards[j] = weightedCards[j], weightedCards[i]
	})
	return weightedCards[0:5]
}

func _checkUserCanAffordPack(userId int, packId int) (bool, int) {
	var price int
	var points int

	packRow := db.Conn.QueryRow("SELECT price FROM packs WHERE id=$1", packId)
	packErr := packRow.Scan(&price)
	if packErr != nil {
		return false, 0
	}

	userRow := db.Conn.QueryRow("SELECT points FROM users WHERE id=$1", userId)
	userErr := userRow.Scan(&points)
	if userErr != nil {
		return false, 0
	}

	return points >= price, price
}

func _saveUserNewCards(userId int, newCards []Card) {
	for i := 0; i < len(newCards); i++ {
		sqlStatement := `
			INSERT INTO user_cards (user_id, card_id)
			VALUES ($1, $2)
		`
		_, err := db.Conn.Exec(sqlStatement, userId, newCards[i].Id)
		if err != nil {
			panic(err)
		}
	}

}
