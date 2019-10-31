package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ServicesController struct{}

// ServicesController экземпляр контроллера сервисов
func NewServicesController() ServicesController {
	return ServicesController{}
}

// Get все сервисы пользователя
func (ServicesController) Get(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	model := struct {
		AutoID  uint64 `form:"auto_id" binding:"required"`
		GroupID uint64 `form:"group_id" binding:"required"`
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

// Update сервис
func (ServicesController) Update(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	serviceIDParam := c.Param("service_id")
	serviceID, err := strconv.ParseUint(serviceIDParam, 10, 64)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	model := struct {
		Odo          *uint32 `json:"odo"`
		NextDistance *uint32 `json:"next_distance"`
		Dt           *string `json:"dt"`
		Description  *string `json:"description"`
		Price        *uint32 `json:"price"`
	}{}

	err = c.BindJSON(&model)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	servicesService := services.NewServicesService(sess.UserID)
	err = servicesService.Update(serviceID, model.Odo, model.NextDistance, model.Dt, model.Description, model.Price)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
