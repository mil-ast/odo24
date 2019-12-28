package services

import (
	"odo24/server/api/models"
	"odo24/server/db"

	"github.com/lib/pq"
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
	conn := db.Conn()

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

// Create создать группу
func (g GroupsService) Create(groupName string) (*models.Group, error) {
	conn := db.Conn()

	querySQL := `select group_id,sort from service_groups.new_group($1,$2)`
	row := conn.QueryRow(querySQL, g.UserID, groupName)

	var model = models.Group{
		Name: groupName,
	}

	err := row.Scan(&model.GroupID, &model.Sort)
	if err != nil {
		return nil, err
	}

	return &model, nil
}

// Update изменить группу
func (g GroupsService) Update(groupID uint64, groupName string) error {
	conn := db.Conn()

	querySQL := `call service_groups.update_group($1,$2,$3)`
	_, err := conn.Exec(querySQL, groupID, g.UserID, groupName)
	return err
}

// Delete удалить группу
func (g GroupsService) Delete(groupID uint64) error {
	conn := db.Conn()

	querySQL := `call service_groups.delete_group($1,$2)`
	_, err := conn.Exec(querySQL, groupID, g.UserID)
	return err
}

// SortUpdate сохранить новую сортировку
func (g GroupsService) SortUpdate(sortedGroups []uint64) error {
	if len(sortedGroups) == 0 {
		return nil
	}

	conn := db.Conn()

	var arr = pq.Int64Array{}
	for _, groupID := range sortedGroups {
		arr = append(arr, int64(groupID))
	}

	querySQL := `call Service_Groups.Update_Sort($1,$2)`
	_, err := conn.Exec(querySQL, g.UserID, arr)
	return err
}
