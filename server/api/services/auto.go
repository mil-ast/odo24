package services

import (
	"odo24/server/api/models"

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
