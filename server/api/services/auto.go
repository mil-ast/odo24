package services

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"odo24/server/api/models"
	"odo24/server/config"
	"os"
	"os/exec"

	"github.com/mil-ast/db"
)

// AutoService сервис Авто
type AutoService struct {
	UserID uint64
}

// NewAutoService экземпляр сервис Авто
func NewAutoService(userID uint64) AutoService {
	return AutoService{
		UserID: userID,
	}
}

// GetAll получить все авто
func (s AutoService) GetAll() ([]models.Auto, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	querySQL := `select avto_id,name,odo,avatar from cars.get_all($1)`
	rows, err := conn.Query(querySQL, s.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var avto models.Auto
	var result []models.Auto
	for rows.Next() {
		avto = models.Auto{}
		err = rows.Scan(&avto.AvtoID, &avto.Name, &avto.Odo, &avto.Avatar)
		if err != nil {
			return nil, err
		}
		result = append(result, avto)
	}

	return result, nil
}

// Create создать авто
func (s AutoService) Create(name string, odo uint32) (*models.Auto, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	avto := models.Auto{
		Name: name,
		Odo:  odo,
	}

	querySQL := `select avto_id,avatar from cars.createavto($1,$2,$3);`
	row := conn.QueryRow(querySQL, name, odo, s.UserID)
	err = row.Scan(&avto.AvtoID, &avto.Avatar)
	if err != nil {
		return nil, err
	}

	return &avto, nil
}

// Update изменить авто
func (s AutoService) Update(autoID uint64, name string, odo uint32, avatar *bool) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	querySQL := `call cars.updateavto($1,$2,$3,$4,$5)`
	_, err = conn.Exec(querySQL, autoID, s.UserID, odo, name, avatar)
	if err != nil {
		return err
	}

	return nil
}

// UpdateODO изменить пробег авто
func (s AutoService) UpdateODO(autoID uint64, odo uint32) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	querySQL := `call cars.updateodo($1,$2,$3)`
	_, err = conn.Exec(querySQL, autoID, s.UserID, odo)
	if err != nil {
		return err
	}

	return nil
}

// Delete удаление авто
func (s AutoService) Delete(autoID uint64) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	querySQL := `call cars.deleteavto($1,$2)`
	_, err = conn.Exec(querySQL, autoID, s.UserID)
	return err
}

func (s AutoService) FileUpload(autoID uint64, fileHeder *multipart.FileHeader) error {
	src, err := fileHeder.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst := fmt.Sprintf("./fileuploads/src/%d_%s", autoID, fileHeder.Filename)

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	if err != nil {
		return err
	}

	cfg := config.GetInstance()

	// medium
	fileOutputPathMedium := fmt.Sprintf("./fileuploads/medium/%d.jpg", autoID)
	args := []string{dst, "-resize", "240x240^", "-gravity", "center", "-extent", "240x240", fileOutputPathMedium}
	cmd := exec.Command(cfg.App.ImageMagick, args...)
	err = cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}

	// удалим большой временный файл
	defer os.Remove(dst)

	// small
	fileOutputPathSmall := fmt.Sprintf("./fileuploads/small/%d.jpg", autoID)
	args = []string{fileOutputPathMedium, "-resize", "60x60", fileOutputPathSmall}
	cmd = exec.Command(cfg.App.ImageMagick, args...)
	err = cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
