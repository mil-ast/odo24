package handlers

import (
	"fmt"
	"log"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"
	"odo24/server/config"
	"odo24/server/oauth"
	"odo24/server/sendmail"
	"odo24/server/sessions"

	"github.com/gin-gonic/gin"
)

// OAuth авторизация
func (ProfileController) OAuth(c *gin.Context) {
	queryParams := c.MustGet(constants.BindOAuthQuery).(models.OAuthQueryParams)

	cfg := config.GetInstance()

	var serviceType oauth.OAuthUserInfo
	switch queryParams.Service {
	case "yandex.ru":
		c := cfg.Oauth.Yandex
		serviceType = oauth.NewOAuthYandexRuUser(c.TokenURL, c.GrantType, c.ClientID, c.ClientSecret, c.RedirectURI)
	case "mail.ru":
		c := cfg.Oauth.MailRu
		serviceType = oauth.NewOAuthMailRuUser(c.TokenURL, c.GrantType, c.ClientID, c.ClientSecret, c.RedirectURI)
	case "google":
		c := cfg.Oauth.Google
		serviceType = oauth.NewOAuthGoogleCom(c.TokenURL, c.GrantType, c.ClientID, c.ClientSecret, c.RedirectURI)
	default:
		c.AbortWithError(http.StatusBadRequest, fmt.Errorf("Uncnown query param '%s'", queryParams.Service))
		return
	}

	token := models.OAuth{
		Type: serviceType,
		Code: queryParams.Code,
	}

	profile, passwd, err := token.GetUser()
	if err != nil {
		if err.Error() == oauth.ErrAuthError {
			c.AbortWithError(http.StatusUnauthorized, err)
		} else {
			log.Println(err)
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	tokenInfo, err := sessions.NewSession(c, profile.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	profileService := services.NewProfileService()
	err = profileService.CheckRefreshToken(profile.UserID, tokenInfo.RT)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// новый
	if passwd != nil {
		go func(login models.Email, pwd models.Password) {
			letter := make(map[string]interface{}, 2)
			letter["login"] = login
			letter["password"] = pwd

			err := sendmail.SendEmail(string(login), sendmail.TypeRegisterFromOAUTH, letter)
			if err != nil {
				log.Println(err)
			}
		}(profile.Login, *passwd)
	}

	c.JSON(http.StatusOK, tokenInfo)
}
