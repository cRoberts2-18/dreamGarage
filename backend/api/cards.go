package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Card struct {
  Name string `json:"name"`
  Image string `json:"image"`
  Rating string `json:"rating"`
  TopSpeed int `json:"topSpeed"`
  Horsepower int `json:"horsepower"`
  Handling int `json:"handling"`
  Engine string `json:"engine"`
  PackId int `json:"packId"`
  Id int `json:"id"`
}

func GetCards(c *gin.Context) {
	cars := [1]Card{{
      Name: "BMW M3 GTR",
      Image: "/placeholder.png",
      Rating: "S+",
      TopSpeed: 174,
      Horsepower: 500,
      Handling: 4,
      Engine: "4.0L Naturally aspirated V8",
      PackId: 1,
      Id: 1}}

	ResponseJSON(c, http.StatusOK, "Cards retrieved successfully", cars)
}

func GetCard(c *gin.Context) {
	carId, err := strconv.Atoi(c.Param("id"))

    if err == nil {
		car := Card{
      Name: "BMW M3 GTR",
      Image: "/placeholder.png",
      Rating: "S+",
      TopSpeed: 174,
      Horsepower: 500,
      Handling: 4,
      Engine: "4.0L Naturally aspirated V8",
      PackId: 1,
      Id: carId}
	
		ResponseJSON(c, http.StatusOK, "Card retrieved successfully", car)
    } else {
		ResponseJSON(c, http.StatusNotFound, "Card not found", nil)
	}

}
