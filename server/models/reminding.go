package models

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/mil-ast/db"
)

type Remining struct {
	Id           uint64 `json:"id"`
	User_id      uint64 `json:"user_id,omitempty"`
	Event_type   string `json:"event_type,omitempty"`
	Date_start   string `json:"date_start"`
	Date_end     string `json:"date_end"`
	Event_before uint16 `json:"event_before"`
	Comment      string `json:"comment"`
}

type Remining_list struct {
	User_id uint64
}

func (l Remining_list) Get() ([]Remining, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	query_sql := "SELECT `id`,`event_type`,`date_start`,`date_end`,`event_before`,`comment` FROM `reminding` WHERE `user_id`=?"
	rows, err := conn.Query(query_sql, l.User_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		id           uint64
		event_type   string
		date_start   string
		date_end     string
		event_before uint16
		comment      sql.NullString
	)

	var responce []Remining

	for rows.Next() {
		rows.Scan(&id, &event_type, &date_start, &date_end, &event_before, &comment)

		responce = append(responce, Remining{
			Id:           id,
			Event_type:   event_type,
			Date_start:   date_start,
			Date_end:     date_end,
			Event_before: event_before,
			Comment:      comment.String,
		})
	}
	rows.Close()

	err = rows.Err()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return responce, nil
}

/* создание */
func (r *Remining) Create() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	var comment sql.NullString
	if r.Comment != "" {
		comment.Scan(r.Comment)
	}

	var dateEnd string = fmt.Sprintf("%s %s", r.Date_end, time.Now().Format("15:04:05"))

	query_sql := "INSERT INTO `reminding` SET `user_id`=?,`event_type`=?,`date_start`=?,`date_end`=?,`event_before`=?,`comment`=?"
	result, err := conn.Exec(query_sql, r.User_id, r.Event_type, r.Date_start, dateEnd, r.Event_before, comment)
	if err != nil {
		log.Println(err)
		return err
	}

	last_id, err := result.LastInsertId()
	if err != nil {
		log.Println(err)
		return err
	}

	r.Id = uint64(last_id)

	// обнулим прочие значения, чтобы не возвращать на клиент
	r.User_id = 0
	r.Event_type = ""

	return nil
}

/* изменение */
func (r *Remining) Update() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	if err = r.checkOwn(); err != nil {
		return err
	}

	var comment sql.NullString
	if r.Comment != "" {
		comment.Scan(r.Comment)
	}

	query_sql := "UPDATE `reminding` SET `date_start`=?,`date_end`=?,`event_before`=?,`comment`=? WHERE `id`=?"
	_, err = conn.Exec(query_sql, r.Date_start, r.Date_end, r.Event_before, comment, r.Id)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/* удаление */
func (r *Remining) Delete() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	if err = r.checkOwn(); err != nil {
		return err
	}

	query_sql := "DELETE FROM `reminding` WHERE `id`=?"
	_, err = conn.Exec(query_sql, r.Id)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func (g Remining) checkOwn() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query_sql := "SELECT `id`,`user_id` FROM `reminding` WHERE `id`=?"
	row := conn.QueryRow(query_sql, g.Id)

	var id, user_id uint64

	row.Scan(&id, &user_id)
	if id == 0 {
		return errors.New("not found")
	}

	if g.User_id != user_id {
		log.Println("not the owner")
		return errors.New("not the owner")
	}

	return nil
}
