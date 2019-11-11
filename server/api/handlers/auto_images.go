package handlers

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AutoImagesController struct{}

// AutoImagesController экземпляр контроллера изображений авто
func NewAutoImagesController() AutoImagesController {
	return AutoImagesController{}
}

// GetImage фото авто
func (AutoImagesController) GetImage(c *gin.Context) {
	urlPart := strings.Split(c.Request.URL.Path, "/")
	if len(urlPart) < 5 {
		c.AbortWithError(http.StatusBadRequest, errors.New("Not found"))
		return
	}

	filePath := fmt.Sprintf("./fileuploads/%s/%s", urlPart[3], urlPart[4])

	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Println(err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	_, err = c.Writer.Write(data)
	if err != nil {
		log.Println(err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
