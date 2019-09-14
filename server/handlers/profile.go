package handlers

import (
	"errors"
	"net/http"
	"sto/server/models"
	"sto/server/sessions"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	userAgent := c.Request.Header.Get("user-agent")
	if userAgent == "" {
		c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		return
	}

	var body models.LoginFromBody
	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	profile, err := models.Login(body.Login, body.Password)
	if err != nil {
		switch err.Error() {
		case "pq: password error", "pq: user not found", "pq: incorrect password":
			c.Status(http.StatusForbidden)
		case "no password is set", "login is not specified":
			c.Status(http.StatusBadRequest)
		default:
			c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		}

		return
	}

	err = sessions.NewSession(c, profile)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, *profile)
}

func ProfileGet(c *gin.Context) {
	profile, err := sessions.GetSession(c)
	if err != nil {
		if err.Error() == "sess: not found" {
			c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.JSON(200, *profile)
}
