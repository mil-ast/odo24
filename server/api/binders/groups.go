package binders

import (
	"net/http"
	"odo24/server/api/constants"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetGroupIDFromParam(c *gin.Context) {
	groupIDParam := c.Param("group_id")

	groupID, err := strconv.ParseUint(groupIDParam, 10, 64)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.Set(constants.BindGroupID, groupID)
}
