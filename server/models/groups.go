package models

import (
	"database/sql"
	"log"

	"github.com/mil-ast/db"
)

type Group struct {
	Group_id uint64 `json:"group_id"`
	Name     string `json:"name"`
	Order    uint16 `json:"order"`
	Global   bool   `json:"global"`
	Cnt      uint16 `json:"cnt"`
	User_id  uint64 `json:"user_id,omitempty"`
}

type GroupsStat struct {
	Group_id uint64 `json:"group_id"`
	Cnt      uint16 `json:"cnt"`
}

type Groups_list struct {
	User_id uint64
	Avto_id uint64
}

/*
	получить список
*/
func (l Groups_list) Get() ([]Group, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var servicesCnt map[uint64]uint16 = make(map[uint64]uint16)
	var querySQL string
	var rows *sql.Rows
	var groupID uint64

	if l.Avto_id > 0 {
		// получим количество
		querySQL = "select group_id,cnt from cars.statsgroups($1,$2)"
		rows, err = conn.Query(querySQL, l.User_id, l.Avto_id)
		if err != nil {
			log.Println(err)
			return nil, err
		}

		var cnt uint16
		for rows.Next() {
			rows.Scan(&groupID, &cnt)
			servicesCnt[groupID] = cnt
		}
		rows.Close()
	}

	querySQL = `select g.group_id,g."name",g.sort,g."global" from cars."groups" g where g.user_id in (0,$1)`
	rows, err = conn.Query(querySQL, l.User_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		name   string
		sort   uint16
		global bool
	)
	var responce []Group

	for rows.Next() {
		rows.Scan(&groupID, &name, &sort, &global)

		responce = append(responce, Group{
			Group_id: groupID,
			Name:     name,
			Order:    sort,
			Global:   global,
			Cnt:      servicesCnt[groupID],
		})
	}
	rows.Close()

	if err = rows.Err(); err != nil {
		log.Println(err)
		return nil, err
	}

	return responce, nil
}

/*
	получить список

func (l Groups_list) GetStats() ([]GroupsStat, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	querySQL := "select * from cars.statsgroups($1,$2)"
	rows, err := conn.Query(querySQL, l.User_id, l.Avto_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		groupID  uint64
		cnt      uint16
		responce []GroupsStat
	)
	for rows.Next() {
		rows.Scan(&groupID, &cnt)
		responce = append(responce, GroupsStat{
			Group_id: groupID,
			Cnt:      cnt,
		})
	}
	rows.Close()

	return responce, nil
}*/

/*
	получить открытый список пользователя

func (l Groups_list) GetPublic(avto_id uint64) ([]Group, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	query_sql := "SELECT `groups`.`group_id`,`groups`.`name`,`groups`.`order`,`groups`.`own` " +
		"FROM `avto` " +
		"INNER JOIN `groups` on `groups`.`user_id` IN (`avto`.`user_id`, '0') " +
		"WHERE `avto`.`avto_id`=?"
	rows, err := conn.Query(query_sql, avto_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		group_id uint64
		name     string
		order    uint16
		own      string
	)
	var responce []Group

	for rows.Next() {
		rows.Scan(&group_id, &name, &order, &own)

		responce = append(responce, Group{
			Group_id: group_id,
			Name:     name,
			Order:    order,
			Own:      own,
		})
	}
	rows.Close()

	if err = rows.Err(); err != nil {
		log.Println(err)
		return nil, err
	}

	return responce, nil
}
*/
/*
	создание группы
*/
func (g *Group) Create() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	g.Global = false

	querySQL := "select group_id,name,sort from cars.creategroup($1,$2)"
	row := conn.QueryRow(querySQL, g.User_id, g.Name)

	err = row.Scan(&g.Group_id, &g.Name, &g.Order)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}

	return nil
}

/*
	изменение группы
*/
func (g *Group) Update() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	querySQL := "select * from cars.updategroup($1,$2,$3)"
	_, err = conn.Exec(querySQL, g.Group_id, g.User_id, g.Name)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/*
	удаление группы
*/
func (g *Group) Delete() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	querySQL := "select * from cars.deletegroup($1,$2)"
	_, err = conn.Exec(querySQL, g.Group_id, g.User_id)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
