package binders

import (
	"errors"
	"log"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/sessions"
	"time"

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

	leftTime := time.Now().Add(sessions.SessionTimeout / 3).Unix()
	if session.Expiration < uint64(leftTime) {
		err = sessions.NewSession(c, session.UserID)
		if err != nil {
			log.Println(err)
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	}

	c.Set(constants.BindProfile, session)
}
