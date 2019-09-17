package binders

import (
	"errors"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/sessions"

	"github.com/gin-gonic/gin"
)

func GetSession(c *gin.Context) {
	profile, err := sessions.GetSession(c)
	if err != nil {
		if err.Error() == "sess: not found" {
			c.AbortWithError(http.StatusForbidden, errors.New(http.StatusText(http.StatusForbidden)))
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Set(constants.BindProfile, profile)
}
