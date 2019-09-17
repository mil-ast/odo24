package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"

	"github.com/gin-gonic/gin"
)

func AvtoGetAll(c *gin.Context) {
	profile := c.MustGet(constants.BindProfile).(*models.Profile)

	list, err := models.AvtoGetAll(profile.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(200, list)
}
