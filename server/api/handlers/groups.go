package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"

	"github.com/gin-gonic/gin"
)

type GroupsController struct{}

// NewGroupsController экземпляр контроллера групп
func NewGroupsController() GroupsController {
	return GroupsController{}
}

// GetAll все группы пользователя
func (GroupsController) GetAll(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	groupService := services.NewGroupsService(sess.UserID)
	list, err := groupService.GetAll()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)
}
