package binders

import (
	"errors"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/sessions"

	"github.com/gin-gonic/gin"
)

//GetSession получение и проверка сессии
func GetSession(c *gin.Context) {
	session, err := sessions.GetSession(c)
	if err != nil {
		switch err.Error() {
		case "expired", "http: named cookie not present":
			c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}

		return
	}

	c.Set(constants.BindProfile, session)
}

//GetRefreshTokenFromBody получить токен рефреша с тела запроса
func GetRefreshTokenFromBody(c *gin.Context) {
	body := struct {
		RT     string `json:"rt" binding:"required"`
		UserID uint64 `json:"user_id" binding:"required"`
	}{}

	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	accessToken, err := sessions.GetToken(c)
	if err != nil {
		c.AbortWithError(http.StatusUnauthorized, errors.New(http.StatusText(http.StatusUnauthorized)))
		return
	}

	if !sessions.CheckRefreshToken(body.RT, accessToken) {
		c.AbortWithError(http.StatusUnauthorized, errors.New(http.StatusText(http.StatusUnauthorized)))
		return
	}

	c.Set(constants.BindRT, body.RT)
	c.Set(constants.BindUserID, body.UserID)
}
