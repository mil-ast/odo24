package models

import (
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/mil-ast/db"
)

type Service struct {
	Service_id uint64 `json:"service_id"`
	Avto_id    uint64 `json:"avto_id"`
	User_id    uint64 `json:"user_id,omitempty"`
	Group_id   uint64 `json:"group_id"`
	Odo        uint32 `json:"odo"`
	Next_odo   uint32 `json:"next_odo,omitempty"`
	Date       string `json:"date"`
	Comment    string `json:"comment,omitempty"`
	Price      uint32 `json:"price,omitempty"`
}

type Services_list struct {
	User_id uint64
	Avto_id uint64
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

	var sql_where_field string
	var queryID uint64

	if l.User_id > 0 {
		sql_where_field = "user_id"
		queryID = l.User_id
	} else {
		sql_where_field = "avto_id"
		queryID = l.Avto_id
	}

	querySQL := `SELECT service_id,avto_id,group_id, odo,next_odo,"date","comment",price FROM cars.services WHERE %s=$1`
	rows, err := conn.Query(fmt.Sprintf(querySQL, sql_where_field), queryID)
	if err != nil {
		return nil, err
	}

	var (
		service_id uint64
		avto_id    uint64
		group_id   uint64
		odo        uint32
		next_odo   sql.NullInt64
		date       string
		comment    sql.NullString
		price      sql.NullInt64
	)

	var responce []Service

	for rows.Next() {
		rows.Scan(&service_id, &avto_id, &group_id, &odo, &next_odo, &date, &comment, &price)

		responce = append(responce, Service{
			Service_id: service_id,
			Avto_id:    avto_id,
			User_id:    0,
			Group_id:   group_id,
			Odo:        odo,
			Next_odo:   uint32(next_odo.Int64),
			Date:       date,
			Comment:    comment.String,
			Price:      uint32(price.Int64),
		})
	}
	rows.Close()

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return responce, nil
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
		next_odo sql.NullInt64
		comment  sql.NullString
		price    sql.NullInt64
	)

	if s.Next_odo > 0 {
		next_odo.Scan(s.Next_odo)
	}
	if s.Comment != "" {
		comment.Scan(s.Comment)
	}
	if s.Price > 0 {
		price.Scan(s.Price)
	}

	query_sql := "INSERT INTO `services` SET `avto_id`=?,`user_id`=?,`group_id`=?,`odo`=?,`next_odo`=?,`date`=?,`comment`=?,`price`=?"
	result, err := conn.Exec(query_sql, s.Avto_id, s.User_id, s.Group_id, s.Odo, next_odo, s.Date, comment, price)
	if err != nil {
		log.Println(err)
		return err
	}

	last_id, err := result.LastInsertId()
	if err != nil {
		log.Println(err)
		return err
	}

	// если новый пробег больше, чем у текущего авто, обновим
	avto := Avto{
		Avto_id: s.Avto_id,
	}

	err = avto.SetODO(s.Odo)
	if err != nil {
		log.Println(err)
	}

	s.Service_id = uint64(last_id)

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

	query_sql := "SELECT `service_id`,`user_id` FROM `services` WHERE `service_id`=?"
	var (
		service_id uint64
		user_id    uint64
	)

	row := conn.QueryRow(query_sql, s.Service_id)
	row.Scan(&service_id, &user_id)
	if service_id == 0 {
		return errors.New("not found")
	}

	if s.User_id != user_id {
		log.Println("not the owner")
		return errors.New("not the owner")
	}

	var (
		next_odo sql.NullInt64
		comment  sql.NullString
		price    sql.NullInt64
	)

	if s.Next_odo > 0 {
		next_odo.Scan(s.Next_odo)
	}
	if s.Comment != "" {
		comment.Scan(s.Comment)
	}
	if s.Price > 0 {
		price.Scan(s.Price)
	}

	query_sql = "UPDATE `services` SET `odo`=?,`next_odo`=?,`date`=?,`comment`=?,`price`=? WHERE `service_id`=?"
	_, err = conn.Exec(query_sql, s.Odo, next_odo, s.Date, comment, price, s.Service_id)
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

	query_sql := "SELECT `service_id`,`user_id` FROM `services` WHERE `service_id`=?"
	var (
		service_id uint64
		user_id    uint64
	)

	row := conn.QueryRow(query_sql, s.Service_id)
	row.Scan(&service_id, &user_id)
	if service_id == 0 {
		return errors.New("not found")
	}

	if s.User_id != user_id {
		log.Println("not the owner")
		log.Printf("not the owner: service_id:%d, user_id:%d \r\n", s.Service_id, s.User_id)
		return errors.New("not the owner")
	}

	query_sql = "DELETE FROM `services` WHERE `service_id`=?"
	_, err = conn.Exec(query_sql, s.Service_id)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
