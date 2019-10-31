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
func (g ServicesService) Get(autoID, groupID uint64) ([]models.Service, error) {
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

// Update редактирование сервиса
func (g ServicesService) Update(serviceID uint64, odo, nextDistance *uint32, dt, descript *string, price *uint32) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	querySQL := `CALL services.update_service($1, $2, $3, $4, $5, $6, $7)`
	_, err = conn.Exec(querySQL, serviceID, g.UserID, odo, nextDistance, dt, descript, price)
	return err
}
