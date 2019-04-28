package models

import (
	"database/sql"
	"log"

	"github.com/mil-ast/db"
)

type Doc struct {
	ID              uint64 `json:"id"`
	UserID          uint64 `json:"user_id,omitempty"`
	AvtoID          uint64 `json:"avto_id,omitempty"`
	EventType       string `json:"event_type,omitempty"`
	DateStart       string `json:"date_start"`
	DateEnd         string `json:"date_end"`
	DaysBeforeEvent uint16 `json:"days_before_event"`
	Comment         string `json:"comment"`
}

type Documents struct {
	User_id uint64
}

func (l Documents) Get() ([]Doc, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	querySQL := `SELECT id,event_type,date_start,date_end,days_before_event,"comment",avto_id FROM reminding.reminding where user_id=$1`
	rows, err := conn.Query(querySQL, l.User_id)
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

	var responce []Doc

	for rows.Next() {
		rows.Scan(&id, &eventType, &dateStart, &dateEnd, &daysBeforeEvent, &comment, &avtoID)

		responce = append(responce, Doc{
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
func (r *Doc) Create() error {
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

	r.AvtoID = uint64(avtoID.Int64)
	r.Comment = comment.String

	return nil
}

/* редактирование */
func (r *Doc) Update() error {
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

	querySQL := `select id,event_type,date_start,date_end,days_before_event,"comment",avto_id from reminding.updateremind($1,$2,$3,$4,$5::int2,$6)`
	row := conn.QueryRow(querySQL, r.ID, r.UserID, r.DateStart, r.DateEnd, r.DaysBeforeEvent, comment)
	err = row.Scan(&r.ID, &r.EventType, &r.DateStart, &r.DateEnd, &r.DaysBeforeEvent, &comment, &avtoID)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}
	if err != nil {
		log.Println(err)
		return err
	}

	r.AvtoID = uint64(avtoID.Int64)
	r.Comment = comment.String

	return nil
}

/* удаление */
func (r Doc) Delete() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	querySQL := "select * from reminding.deleteremind($1,$2)"
	_, err = conn.Exec(querySQL, r.ID, r.UserID)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}
