package handlers

import (
	"net/http"
	"sto/server/api/models"
	"sto/server/sessions"

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
