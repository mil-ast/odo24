package handlers

import (
	"net/http"
	"odo24/server/api/constants"
	"odo24/server/api/models"
	"odo24/server/api/services"

	"github.com/gin-gonic/gin"
)

type DocumentsController struct{}

// NewDocumentsController экземпляр контроллера документов
func NewDocumentsController() DocumentsController {
	return DocumentsController{}
}

// Create все группы пользователя
func (DocumentsController) Create(c *gin.Context) {
	sess := c.MustGet(constants.BindProfile).(*models.SessionValue)

	var model models.DocumentCreateBody
	err := c.BindJSON(&model)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	docService := services.NewDocumentsService(sess.UserID)
	docID, err := docService.Create(model.AutoID, model.DateStart, model.DateEnd, model.Descript, model.DocTypeID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	res := struct {
		DocID *uint64 `json:"doc_id"`
	}{
		DocID: docID,
	}
	c.JSON(http.StatusCreated, res)
}
