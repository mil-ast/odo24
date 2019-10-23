package handlers

import (
	"errors"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AutoController struct{}

// NewAutoController экземпляр контроллера Автомобилей
func NewAutoController() AutoController {
	return AutoController{}
}

// GetAll все авто пользователя
func (AutoController) GetAll(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	autoService := services.NewAutoService(sess.UserID)
	list, err := autoService.GetAll()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)
}

// Create создание авто
func (AutoController) Create(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	model := models.AutoCreateBody{}

	err := c.BindJSON(&model)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if len(model.Name) < 3 {
		c.AbortWithError(http.StatusBadRequest, errors.New("car name too short"))
		return
	}

	autoService := services.NewAutoService(sess.UserID)
	auto, err := autoService.Create(model.Name, model.Odo)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, auto)
}

// Delete удаление авто
func (AutoController) Delete(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	autoIDFromParam := c.Param("auto_id")
	autoID, err := strconv.ParseUint(autoIDFromParam, 10, 64)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	autoService := services.NewAutoService(sess.UserID)
	err = autoService.Delete(autoID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
