// Package response handles the response body
package response

import "github.com/gin-gonic/gin"

func OK(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{"status": 1, "data": data})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{"status": 0, "error": msg})
}
