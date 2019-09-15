package models

import (
	"github.com/mil-ast/db"
)

type Avto struct {
	AvtoID uint64 `json:"avto_id"`
	Name   string `json:"name"`
	Odo    uint32 `json:"odo"`
	Avatar bool   `json:"avatar"`
}

func AvtoGetAll(userID uint64) ([]Avto, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	querySQL := `select avto_id, name, odo, avatar from cars.get_all($1)`
	rows, err := conn.Query(querySQL, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var avto Avto
	var result []Avto
	for rows.Next() {
		avto = Avto{}
		err = rows.Scan(&avto.AvtoID, &avto.Name, &avto.Odo, &avto.Avatar)
		if err != nil {
			return nil, err
		}
		result = append(result, avto)
	}

	return result, nil
}
