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
	var body models.LoginFromBody
	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.Login.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	if !body.Password.IsValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid password"))
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

// Logout выход из профиля
func Logout(c *gin.Context) {
	sessions.DeleteSession(c)
	c.Status(http.StatusNoContent)
}

// ProfileGet получение текущего профиля
func ProfileGet(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	profile, err := services.GetProfile(sess.UserID)
	if err != nil {
		log.Println(err)
		c.AbortWithError(http.StatusInternalServerError, errors.New(http.StatusText(http.StatusInternalServerError)))
		return
	}
	c.JSON(200, *profile)
}

// Register регистрация
func Register(c *gin.Context) {
	var body models.EmailFromBody
	err := c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.Email.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	err = services.Register(body.Email)
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

// PasswordRecovery восстановление пароля
func PasswordRecovery(c *gin.Context) {
	var body models.EmailFromBody
	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.Email.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	err = services.PasswordRecovery(body.Email)
	if err != nil {
		log.Println(err)
		switch err.Error() {
		case "pq: login is empty", "pq: login not found":
			c.AbortWithError(http.StatusBadRequest, errors.New(http.StatusText(http.StatusBadRequest)))
		default:
			c.AbortWithError(http.StatusInternalServerError, errors.New(http.StatusText(http.StatusInternalServerError)))
		}
		return
	}
	c.Status(http.StatusNoContent)
}

// PasswordUpdate изменение пароля из личного кабинета
func PasswordUpdate(c *gin.Context) {
	profile := c.MustGet(constants.BindProfile).(*models.Profile)
	body := models.PasswordFromBody{}

	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.Password.IsValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid password"))
		return
	}

	err = services.PasswordUpdate(profile.UserID, body.Password)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// ResetPassword Сброс пароля
func ResetPassword(c *gin.Context) {
	var body models.RegisterResetPasswordFromBody
	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !body.Login.IsEmailValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid email"))
		return
	}

	if !body.Password.IsValid() {
		c.AbortWithError(http.StatusBadRequest, errors.New("invalid password"))
		return
	}

	if body.Code == nil && body.LinkKey == nil {
		c.AbortWithError(http.StatusBadRequest, errors.New("code and linkKey is emptyd"))
		return
	}

	err = services.ResetPassword(body.Login, body.Password, body.Code, body.LinkKey)
	if err != nil {
		if err.Error() == "incorrect" {
			c.AbortWithError(http.StatusBadRequest, err)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Status(http.StatusNoContent)
}
