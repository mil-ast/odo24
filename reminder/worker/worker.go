package worker

import (
	"database/sql"
	"log"
	"time"

	"odo24/server/db"
)

const TickTimeout = time.Minute * 10

func Start() {
	ticker := time.NewTicker(TickTimeout)

	go run(time.Now())
	for now := range ticker.C {
		go run(now)
	}
}

func run(now time.Time) {
	rows, err := getRows()
	if err != nil {
		log.Println(err)
		return
	}

	err = rows.Send()
	if err != nil {
		log.Println(err)
	}
}

func getRows() (EventList, error) {
	var result EventList = EventList{}

	conn, err := db.GetConnection()
	if err != nil {
		return result, err
	}

	querySql := "select id,event_type,date_start,date_end,avto_id,login,car_name from reminding.getforevent limit 20"
	rows, err := conn.Query(querySql)
	if err != nil {
		return result, err
	}

	var row Event
	var (
		avtoId  sql.NullInt64
		carName sql.NullString
	)
	for rows.Next() {
		row = Event{}

		rows.Scan(&row.ID, &row.EventType, &row.DateStart, &row.DateEnd, &avtoId, &row.Email, &carName)

		row.AvtoID = uint64(avtoId.Int64)
		row.CarName = carName.String
		result.List = append(result.List, row)
	}
	rows.Close()

	err = rows.Err()
	if err != nil {
		return result, err
	}

	return result, nil
}
