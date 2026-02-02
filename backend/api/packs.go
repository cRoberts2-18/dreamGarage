package api

import (
	"database/sql"
	"dream_grarage_api/db"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pack struct {
	Id    int    `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
	Price int    `json:"price"`
	Featured bool `json:"featured"`
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
