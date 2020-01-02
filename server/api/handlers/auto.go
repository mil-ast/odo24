package handlers

import (
	"errors"
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"

	"github.com/gin-gonic/gin"
)

// AutoController контроллер
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
		c.AbortWithError(http.StatusBadRequest, errors.New("the name is too short"))
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

// Update изменение авто
func (AutoController) Update(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	model := models.AutoUpdateBody{}
	if err := c.Bind(&model); err != nil {
		c.String(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
		return
	}

	autoID := c.MustGet(constants.BindAutoID).(uint64)
	autoService := services.NewAutoService(sess.UserID)

	var avatar *bool
	file, err := c.FormFile("file")
	if err == nil {
		err = autoService.FileUpload(autoID, file)
		if err != nil {
			c.String(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
			return
		}

		avatar = new(bool)
		*avatar = true
	}

	err = autoService.Update(autoID, model.Name, model.Odo, avatar)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdateODO изменение пробега авто
func (AutoController) UpdateODO(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	model := models.AutoUpdateODOBody{}
	if err := c.Bind(&model); err != nil {
		c.String(http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
		return
	}

	autoID := c.MustGet(constants.BindAutoID).(uint64)
	autoService := services.NewAutoService(sess.UserID)

	err := autoService.UpdateODO(autoID, model.Odo)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// Delete удаление авто
func (AutoController) Delete(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	autoID := c.MustGet(constants.BindAutoID).(uint64)

	autoService := services.NewAutoService(sess.UserID)
	err := autoService.Delete(autoID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
