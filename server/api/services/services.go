package services

import (
	"odo24/server/api/models"
	"odo24/server/db"
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
	conn := db.Conn()

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

// Create создание сервиса
func (g ServicesService) Create(autoID, groupID uint64, odo, nextDistance *uint32, dt, descript *string, price *uint32) (*uint64, error) {
	conn := db.Conn()

	querySQL := `select service_id from services.create_service($1, $2, $3, $4, $5, $6, $7, $8)`
	row := conn.QueryRow(querySQL, autoID, g.UserID, groupID, odo, nextDistance, dt, descript, price)

	var serviceID uint64
	err = row.Scan(&serviceID)

	return &serviceID, err
}

// Update редактирование сервиса
func (g ServicesService) Update(serviceID uint64, odo, nextDistance *uint32, dt, descript *string, price *uint32) error {
	conn := db.Conn()
	querySQL := `CALL services.update_service($1, $2, $3, $4, $5, $6, $7)`
	_, err = conn.Exec(querySQL, serviceID, g.UserID, odo, nextDistance, dt, descript, price)
	return err
}

// Delete удаление сервиса
func (g ServicesService) Delete(serviceID uint64) error {
	conn := db.Conn()
	querySQL := `CALL services.delete_service($1, $2)`
	_, err = conn.Exec(querySQL, serviceID, g.UserID)
	return err
}
