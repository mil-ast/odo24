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

type ProfileController struct{}

// NewProfileController экземпляр контроллера Профиля
func NewProfileController() ProfileController {
	return ProfileController{}
}

// Login авторизация через логин/пароль
func (ProfileController) Login(c *gin.Context) {
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

	log.Println(body.Login, body.Password)

	profileService := services.NewProfileService()
	profile, err := profileService.Login(body.Login, body.Password)
	if err != nil {
		switch err.Error() {
		case "pq: login is empty":
			c.Status(http.StatusBadRequest)
		default:
			c.AbortWithError(http.StatusUnauthorized, errors.New(http.StatusText(http.StatusUnauthorized)))
		}

		return
	}

	tokenInfo, err := sessions.NewSession(c, profile.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = profileService.SetRefreshToken(profile.UserID, tokenInfo.RT)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, *tokenInfo)
}

// Logout выход из профиля
func (ProfileController) Logout(c *gin.Context) {
	sessions.DeleteSession(c)
	c.Status(http.StatusNoContent)
}

// RefreshToken получить новые токены по рефреш токену
func (ProfileController) RefreshToken(c *gin.Context) {
	rt := c.MustGet(constants.BindRT).(string)
	userID := c.MustGet(constants.BindUserID).(uint64)

	profileService := services.NewProfileService()
	currRt, err := profileService.GetRefreshToken(userID)
	if err != nil {
		log.Println(err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if currRt == nil || *currRt != rt {
		c.AbortWithError(http.StatusUnauthorized, errors.New(http.StatusText(http.StatusUnauthorized)))
		return
	}

	tokenInfo, err := sessions.NewSession(c, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = profileService.SetRefreshToken(userID, tokenInfo.RT)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, *tokenInfo)
}

// ProfileGet получение текущего профиля
func (ProfileController) ProfileGet(c *gin.Context) {
	profileService := services.NewProfileService()
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	profile, err := profileService.GetProfile(sess.UserID)
	if err != nil {
		log.Println(err)
		c.AbortWithError(http.StatusInternalServerError, errors.New(http.StatusText(http.StatusInternalServerError)))
		return
	}
	c.JSON(200, *profile)
}

// Register регистрация
func (ProfileController) Register(c *gin.Context) {
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

	profileService := services.NewProfileService()
	err = profileService.Register(body.Email)
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
func (ProfileController) PasswordRecovery(c *gin.Context) {
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

	profileService := services.NewProfileService()
	err = profileService.PasswordRecovery(body.Email)
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
func (ProfileController) PasswordUpdate(c *gin.Context) {
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

	profileService := services.NewProfileService()
	err = profileService.PasswordUpdate(profile.UserID, body.Password)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// ResetPassword Сброс пароля
func (ProfileController) ResetPassword(c *gin.Context) {
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

	profileService := services.NewProfileService()
	err = profileService.ResetPassword(body.Login, body.Password, body.Code, body.LinkKey)
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
