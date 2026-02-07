package main

import (
	"dream_grarage_api/api"
	"dream_grarage_api/db"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	_ "github.com/lib/pq"
)

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=disable",
		db.Host, db.Port, db.User, db.Password, db.Dbname)

		var err error
	db.Conn, err = sqlx.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Conn.Close()

	err = db.Conn.Ping()
	if err != nil {
		panic(err)
	}

	r := gin.Default()

	r.Use(api.CORSMiddleware())

	// Public routes
	r.POST("/token", api.GenerateJWT)
	r.POST("/user/create", api.InsertUser)
	r.POST("/packs/:id/purchase", api.PurchasePack)
	
	// protected routes
	protected := r.Group("/", api.JWTAuthMiddleware())
	{
		// Cars
		protected.GET("/cards", api.GetCards)
		protected.GET("/cards/:id", api.GetCard)
		protected.POST("/cards/owned", api.GetUserOwnedCards)
		
		// Packs
		protected.GET("/packs", api.GetPacks)
		protected.GET("/packs/:id", api.GetPack)

		// users
		protected.POST("/user/points", api.UpdateUserPoints)
	}

	r.Run(":6767")
}
