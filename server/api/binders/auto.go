package binders

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"

	"github.com/gin-gonic/gin"
)

func GetCreateAutoFromBody(c *gin.Context) {
	query := models.OAuthQueryParams{}

	err := c.BindQuery(&query)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.Set(constants.BindOAuthQuery, query)
}
