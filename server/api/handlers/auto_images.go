package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AutoImagesController struct{}

// AutoImagesController экземпляр контроллера изображений авто
func NewAutoImagesController() AutoImagesController {
	return AutoImagesController{}
}

// GetImage фото авто
func (AutoImagesController) GetImage(c *gin.Context) {
	size := c.Param("size")
	fileName := c.Param("file")

	filePath := fmt.Sprintf("./fileuploads/%s/%s", size, fileName)

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
