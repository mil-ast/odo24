package models

import (
	"database/sql"
	"log"

	"github.com/mil-ast/db"
)

type Remining struct {
	ID              uint64 `json:"id"`
	UserID          uint64 `json:"user_id,omitempty"`
	AvtoID          uint64 `json:"avto_id,omitempty"`
	EventType       string `json:"event_type,omitempty"`
	DateStart       string `json:"date_start"`
	DateEnd         string `json:"date_end"`
	DaysBeforeEvent uint16 `json:"days_before_event"`
	Comment         string `json:"comment"`
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

	query_sql := `SELECT id,event_type,date_start,date_end,days_before_event,"comment",avto_id FROM reminding.reminding where user_id=$1`
	rows, err := conn.Query(query_sql, l.User_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		id              uint64
		eventType       string
		dateStart       string
		dateEnd         string
		daysBeforeEvent uint16
		comment         sql.NullString
		avtoID          sql.NullInt64
	)

	var responce []Remining

	for rows.Next() {
		rows.Scan(&id, &eventType, &dateStart, &dateEnd, &daysBeforeEvent, &comment, &avtoID)

		responce = append(responce, Remining{
			ID:              id,
			EventType:       eventType,
			DateStart:       dateStart,
			DateEnd:         dateEnd,
			DaysBeforeEvent: daysBeforeEvent,
			Comment:         comment.String,
			AvtoID:          uint64(avtoID.Int64),
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
	var avtoID sql.NullInt64
	if r.EventType == "insurance" {
		avtoID.Scan(r.AvtoID)
	}
	querySQL := `select id,event_type,date_start,date_end,days_before_event,"comment",avto_id from reminding.createremind($1,$2,$3,$4,$5,$6::int2,$7)`
	row := conn.QueryRow(querySQL, r.UserID, avtoID, r.EventType, r.DateStart, r.DateEnd, r.DaysBeforeEvent, comment)

	err = row.Scan(&r.ID, &r.EventType, &r.DateStart, &r.DateEnd, &r.DaysBeforeEvent, &comment, &avtoID)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}

	if avtoID.Int64 != 0 {
		r.AvtoID = uint64(avtoID.Int64)
	}

	r.Comment = comment.String

	return nil
}

/*
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
*/
