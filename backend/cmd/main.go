package main

import (
	"dream_grarage_api/api"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

r.Use(api.CORSMiddleware())

	// Public routes
	r.POST("/token", api.GenerateJWT)

	// protected routes
	protected := r.Group("/", api.JWTAuthMiddleware())
	{
		// Cars
		protected.GET("/cards", api.GetCards)
		protected.GET("/cards/:id", api.GetCard)

		// Packs
		protected.GET("/packs", api.GetPacks)
		protected.GET("/packs/:id", api.GetPacks)
	}

	r.Run(":6767")
}
