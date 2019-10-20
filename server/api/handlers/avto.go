package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"

	"github.com/gin-gonic/gin"
)

func AvtoGetAll(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	list, err := models.AvtoGetAll(sess.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)
}
