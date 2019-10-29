package services

import (
	"odo24/server/api/models"

	"github.com/mil-ast/db"
)

// ServicesService сервис сервисов
type ServicesService struct {
	UserID uint64
}

// NewServicesService экземпляр сервиса
func NewServicesService(userID uint64) ServicesService {
	return ServicesService{
		UserID: userID,
	}
}

// Get список сервисов
func (g ServicesService) Get(autoID, groupID int64) ([]models.Service, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	querySQL := `select service_id,odo,next_distance,dt,description,price from services.get_all($1,$2,$3)`
	rows, err := conn.Query(querySQL, g.UserID, autoID, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var service models.Service
	var result []models.Service
	for rows.Next() {
		service = models.Service{}
		err = rows.Scan(&service.ServiceID, &service.Odo, &service.NextDistance, &service.Dt, &service.Description, &service.Price)
		if err != nil {
			return nil, err
		}
		result = append(result, service)
	}

	return result, nil
}
