package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := gin.Default()

	r.LoadHTMLFiles("index.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	port := os.Getenv("PORT_WEB")
	if port == "" {
		port = ""
	}
	r.Run("0.0.0.0:" + port) // serve on localhost:8080

}
