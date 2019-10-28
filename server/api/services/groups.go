package services

import (
	"odo24/server/api/models"

	"github.com/mil-ast/db"
)

// GroupsService сервис групп
type GroupsService struct {
	UserID uint64
}

// NewGroupsService экземпляр сервиса групп
func NewGroupsService(userID uint64) GroupsService {
	return GroupsService{
		UserID: userID,
	}
}

// GetAll список групп пользователя
func (g GroupsService) GetAll() ([]models.Group, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	querySQL := `select group_id,group_name,sort from service_groups.getforuser($1)`
	rows, err := conn.Query(querySQL, g.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var group models.Group
	var result []models.Group
	for rows.Next() {
		group = models.Group{}
		err = rows.Scan(&group.GroupID, &group.Name, &group.Sort)
		if err != nil {
			return nil, err
		}
		result = append(result, group)
	}

	return result, nil
}
