package handlers

import (
	"errors"
	"log"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"
	"odo24/server/sessions"

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

	if !body.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	profile, err := services.Login(body.Login, body.Password)
	if err != nil {
		switch err.Error() {
		case "pq: login is empty":
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

func Logout(c *gin.Context) {
	sessions.DeleteSession(c)
	c.Status(http.StatusNoContent)
}

func ProfileGet(c *gin.Context) {
	profile := c.MustGet(constants.BindProfile).(*models.Profile)
	c.JSON(200, *profile)
}

// Register регистрация
func Register(c *gin.Context) {
	userAgent := c.Request.Header.Get("user-agent")
	if userAgent == "" {
		c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		return
	}

	var body models.RegisterLoginFromBody
	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	err = services.Register(body.Login)
	if err != nil {
		log.Println(err)
		switch err.Error() {
		case "pq: login is empty":
			c.AbortWithError(http.StatusBadRequest, errors.New(http.StatusText(http.StatusBadRequest)))
		case "pq: login is exists":
			c.AbortWithError(http.StatusConflict, errors.New(http.StatusText(http.StatusConflict)))
		default:
			c.AbortWithError(http.StatusInternalServerError, errors.New(http.StatusText(http.StatusInternalServerError)))
		}

		return
	}

	c.Status(http.StatusNoContent)
}
