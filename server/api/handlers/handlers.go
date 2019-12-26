package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func sessionErrorHandler(c *gin.Context, err error) {
	if err.Error() == "sess: not found" {
		c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
	} else {
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

func CheckUserAgent(c *gin.Context) {
	userAgent := c.Request.Header.Get("user-agent")
	if userAgent == "" {
		c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		return
	}
}

func Ping(c *gin.Context) {
	c.String(http.StatusOK, http.StatusText(http.StatusOK))
}
