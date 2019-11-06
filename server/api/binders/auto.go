package binders

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAutoIDFromParam(c *gin.Context) {
	autoIDFromParam := c.Param("auto_id")
	autoID, err := strconv.ParseUint(autoIDFromParam, 10, 64)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.Set(constants.BindAutoID, autoID)
}

func GetCreateAutoFromBody(c *gin.Context) {
	query := models.OAuthQueryParams{}

	err := c.BindQuery(&query)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.Set(constants.BindOAuthQuery, query)
}
