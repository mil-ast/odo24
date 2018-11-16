package models

import (
	"errors"
	"log"

	"github.com/mil-ast/db"
)

type Group struct {
	Group_id uint64 `json:"group_id"`
	Name     string `json:"name"`
	Order    uint16 `json:"order"`
	Own      string `json:"own"`
	User_id  uint64 `json:"user_id,omitempty"`
}

type Groups_list struct {
	User_id uint64
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

	query_sql := "SELECT `group_id`,`name`,`order`,`own` FROM `groups` WHERE `user_id` IN ('0', ?)"
	rows, err := conn.Query(query_sql, l.User_id)
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

/*
	получить открытый список пользователя
*/
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

/*
	создание группы
*/
func (g *Group) Create() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	g.Order = 10
	g.Own = "USER"

	query_sql := "INSERT INTO `groups` SET `user_id`=?,`name`=?,`order`=?,`own`=?"
	result, err := conn.Exec(query_sql, g.User_id, g.Name, g.Order, g.Own)
	if err != nil {
		log.Println(err)
		return err
	}

	last_id, err := result.LastInsertId()
	if err != nil {
		log.Println(err)
		return err
	}

	g.Group_id = uint64(last_id)

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

	err = g.checkOwn()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql := "UPDATE `groups` SET `name`=? WHERE `group_id`=?"
	_, err = conn.Exec(query_sql, g.Name, g.Group_id)
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

	err = g.checkOwn()
	if err != nil {
		log.Println(err)
		return err
	}

	tx, err := conn.Begin()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql := "DELETE FROM `services` WHERE `group_id`=?"
	_, err = tx.Exec(query_sql, g.Group_id)
	if err != nil {
		log.Println(err)
		tx.Rollback()
		return err
	}

	query_sql = "DELETE FROM `groups` WHERE `group_id`=?"
	_, err = tx.Exec(query_sql, g.Group_id)
	if err != nil {
		log.Println(err)
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	if err != nil {
		log.Println(err)
		tx.Rollback()
		return err
	}

	return nil
}

func (g Group) checkOwn() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query_sql := "SELECT `group_id`,`user_id` FROM `groups` WHERE `group_id`=?"
	row := conn.QueryRow(query_sql, g.Group_id)

	var group_id, user_id uint64

	row.Scan(&group_id, &user_id)
	if group_id == 0 {
		return errors.New("not found")
	}

	if g.User_id != user_id {
		log.Println("not the owner")
		return errors.New("not the owner")
	}

	return nil
}
