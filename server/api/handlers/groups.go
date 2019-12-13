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

// Create новая группа
func (GroupsController) Create(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	body := struct {
		GroupName string `json:"group_name" binding:"required"`
	}{}

	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusUnavailableForLegalReasons, err)
		return
	}

	groupService := services.NewGroupsService(sess.UserID)
	group, err := groupService.Create(body.GroupName)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, group)
}

// Update сохраним группу
func (GroupsController) Update(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	body := struct {
		GroupName string `json:"group_name" binding:"required"`
	}{}

	err := c.BindJSON(&body)
	if err != nil {
		c.AbortWithError(http.StatusUnavailableForLegalReasons, err)
		return
	}

	groupID := c.MustGet(constants.BindGroupID).(uint64)

	groupService := services.NewGroupsService(sess.UserID)
	err = groupService.Update(groupID, body.GroupName)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// Delete сохраним группу
func (GroupsController) Delete(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	groupID := c.MustGet(constants.BindGroupID).(uint64)

	groupService := services.NewGroupsService(sess.UserID)
	err := groupService.Delete(groupID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// SortUpdate сохранить сортировку
func (GroupsController) SortUpdate(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	var sortedGroups []uint64
	err := c.BindJSON(&sortedGroups)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	groupService := services.NewGroupsService(sess.UserID)
	err = groupService.SortUpdate(sortedGroups)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
