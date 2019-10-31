package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"

	"github.com/gin-gonic/gin"
)

type ServicesController struct{}

// ServicesController экземпляр контроллера сервисов
func NewServicesController() ServicesController {
	return ServicesController{}
}

// Get все группы пользователя
func (ServicesController) Get(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	model := struct {
		AutoID  int64 `form:"auto_id" binding:"required"`
		GroupID int64 `form:"group_id" binding:"required"`
	}{}

	err := c.BindQuery(&model)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	servicesService := services.NewServicesService(sess.UserID)
	list, err := servicesService.Get(model.AutoID, model.GroupID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)
}
