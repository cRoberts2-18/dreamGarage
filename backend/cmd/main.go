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
		protected.POST("/cards/sell", api.SellCard)
		
		// Packs
		protected.GET("/packs", api.GetPacks)
		protected.GET("/packs/:id", api.GetPack)

		// users
		protected.POST("/user/points", api.UpdateUserPoints)
		protected.POST("/user/dream-garage", api.GetDreamGarage)
		protected.PUT("/user/dream-garage", api.UpdateDreamGarage)

		// friends
		protected.POST("/friends/request", api.SendFriendRequest)
		protected.POST("/friends/requests", api.GetFriendRequests)
		protected.PUT("/friends/request/:id", api.RespondToFriendRequest)
		protected.POST("/friends", api.GetFriends)
		protected.DELETE("/friends/:id", api.RemoveFriend)
		protected.POST("/friends/:friendId/dream-garage", api.GetFriendDreamGarage)
		protected.POST("/friends/:friendId/cards", api.GetFriendCards)

		// trades
		protected.POST("/trades", api.CreateTrade)
		protected.POST("/trades/active", api.GetActiveTrades)
		protected.PUT("/trades/:id/accept", api.AcceptTrade)
		protected.PUT("/trades/:id/reject", api.RejectTrade)
		protected.PUT("/trades/:id/cancel", api.CancelTrade)
		protected.PUT("/trades/:id/counter", api.CounterTrade)
		protected.POST("/trades/history", api.GetTradeHistory)
	}

	r.Run(":6767")
}
