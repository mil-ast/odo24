package models

import (
	"database/sql"
	"errors"
	"log"

	"github.com/mil-ast/db"
)

type Service struct {
	Service_id    uint64 `json:"service_id"`
	Avto_id       uint64 `json:"avto_id"`
	User_id       uint64 `json:"user_id,omitempty"`
	Group_id      uint64 `json:"group_id"`
	Odo           uint32 `json:"odo"`
	Next_distance uint32 `json:"next_distance,omitempty"`
	Date          string `json:"date"`
	Comment       string `json:"comment,omitempty"`
	Price         uint32 `json:"price,omitempty"`
}

type Services_list struct {
	User_id  uint64
	Group_id uint64
	Avto_id  uint64
}

/*
	получить список
*/
func (l Services_list) Get() ([]Service, error) {
	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	if l.Avto_id == 0 && l.User_id == 0 {
		return nil, errors.New("empty data")
	}

	querySQL := `SELECT service_id,avto_id,group_id, odo,next_distance,"date","comment",price::numeric FROM cars.services WHERE user_id=$1 and avto_id=$2 and group_id=$3`
	rows, err := conn.Query(querySQL, l.User_id, l.Avto_id, l.Group_id)
	if err != nil {
		return nil, err
	}

	var (
		service_id    uint64
		avto_id       uint64
		group_id      uint64
		odo           uint32
		next_distance sql.NullInt64
		date          string
		comment       sql.NullString
		price         sql.NullFloat64
	)

	var responce []Service

	for rows.Next() {
		rows.Scan(&service_id, &avto_id, &group_id, &odo, &next_distance, &date, &comment, &price)

		responce = append(responce, Service{
			Service_id:    service_id,
			Avto_id:       avto_id,
			Group_id:      group_id,
			Odo:           odo,
			Next_distance: uint32(next_distance.Int64),
			Date:          date,
			Comment:       comment.String,
			Price:         uint32(price.Float64),
		})
	}
	rows.Close()

	return responce, rows.Err()
}

/*
	создание
*/
func (s *Service) Create() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	var (
		nextODO sql.NullInt64
		comment sql.NullString
		price   sql.NullInt64
	)

	if s.Next_distance > 0 {
		nextODO.Scan(s.Next_distance)
	}
	if s.Comment != "" {
		comment.Scan(s.Comment)
	}
	if s.Price > 0 {
		price.Scan(s.Price)
	}

	querySQL := "select service_id from cars.createservice($1,$2,$3,$4,$5,$6::date,$7,$8::money)"
	row := conn.QueryRow(querySQL, s.Avto_id, s.User_id, s.Group_id, s.Odo, nextODO, s.Date, comment, price)

	err = row.Scan(&s.Service_id)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}

	return nil
}

/*
	изменение
*/
func (s Service) Update() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	var (
		nextODO sql.NullInt64
		comment sql.NullString
		price   sql.NullInt64
	)

	if s.Next_distance > 0 {
		nextODO.Scan(s.Next_distance)
	}
	if s.Comment != "" {
		comment.Scan(s.Comment)
	}
	if s.Price > 0 {
		price.Scan(s.Price)
	}

	querySQL := "SELECT * from cars.updateservice($1,$2,$3,$4,$5::date,$6,$7::money)"
	_, err = conn.Exec(querySQL, s.Service_id, s.User_id, s.Odo, nextODO, s.Date, comment, price)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/*
	удаление
*/
func (s Service) Delete() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	querySQL := "select * from cars.deleteservice($1,$2)"
	_, err = conn.Exec(querySQL, s.Service_id, s.User_id)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}