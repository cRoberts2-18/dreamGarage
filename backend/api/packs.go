package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type pack struct {
	Id    int    `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
	Price int    `json:"price"`
	Featured bool `json:"featured"`
}

func GetPacks(c *gin.Context) {
	packs := [10]pack{
		{
			Name:  "Hot hatches",
			Image: "/placeholder.png",
			Id:    1,
			Featured: true,
			Price: 600},
		{
			Name:  "Track Monsters",
			Image: "/placeholder.png",
			Id:    2,
			Featured: true,
			Price: 600},
		{
			Name:  "Supercars",
			Image: "/placeholder.png",
			Id:    3,
			Featured: true,
			Price: 600},
		{
			Name:  "Offroaders",
			Image: "/placeholder.png",
			Id:    4,
			Featured: true,
			Price: 600},
		{
			Name:  "JDM Legends",
			Image: "/placeholder.png",
			Id:    5,
			Featured: true,
			Price: 600},
		{
			Name:  "All-American Muscle",
			Image: "/placeholder.png",
			Id:    6,
			Featured: false,
			Price: 600},
		{
			Name:  "Hybrid Heroes",
			Image: "/placeholder.png",
			Id:    7,
			Featured: false,
			Price: 600},
		{
			Name:  "Roaring V12s",
			Image: "/placeholder.png",
			Id:    8,
			Featured: false,
			Price: 600},
		{
			Name:  "Grand Tourers",
			Image: "/placeholder.png",
			Id:    9,
			Featured: false,
			Price: 600},
		{
			Name:  "Budget Sports Cars",
			Image: "/placeholder.png",
			Id:    10,
			Featured: false,
			Price: 600}}

	ResponseJSON(c, http.StatusOK, "Packs retrived successfully", packs)
}

func GetPack(c *gin.Context) {
	packId, err := strconv.Atoi(c.Param("id"))

	if err == nil {
		pack := pack{
			Name:  "Hot hatches",
			Image: "/placeholder.png",
			Price: 600,
			Id:    packId}

		ResponseJSON(c, http.StatusOK, "Pack retrieved Successfully", pack)
	} else {
		ResponseJSON(c, http.StatusNotFound, "pack not found", nil)
	}

}
