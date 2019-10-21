package handlers

import (
	"fmt"
	"log"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/oauth"
	"odo24/server/sessions"

	"github.com/gin-gonic/gin"
)

// OAuth авторизация
func (ProfileController) OAuth(c *gin.Context) {
	queryParams := c.MustGet(constants.BindOAuthQuery).(models.OAuthQueryParams)

	var serviceType oauth.OAuthUserInfo
	switch queryParams.Service {
	case "yandex.ru":
		serviceType = oauth.OAuthYandexRuUser{}
	case "mail.ru":
		serviceType = oauth.OAuthMailRuUser{}
	case "google":
		serviceType = oauth.OAuthGoogleComUser{}
	default:
		c.AbortWithError(http.StatusBadRequest, fmt.Errorf("Uncnown query param '%s'", queryParams.Service))
		return
	}

	token := models.OAuth{
		Type: serviceType,
		Code: queryParams.Code,
	}

	profile, err := token.GetUser()
	if err != nil {
		if err.Error() == oauth.ErrAuthError {
			c.AbortWithError(http.StatusBadRequest, err)
		} else {
			log.Println(err)
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	err = sessions.NewSession(c, profile.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, profile)
}
