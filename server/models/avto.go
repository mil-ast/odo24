package models

import (
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"os/exec"
	"sto/server/config"
	"strings"

	"github.com/mil-ast/db"
)

type Avto struct {
	Avto_id uint64 `json:"avto_id"`
	Name    string `json:"name"`
	Odo     uint32 `json:"odo"`
	User_id uint64 `json:"user_id,omitempty"`
	Avatar  bool   `json:"avatar"`
}

type Avto_list struct {
	User_id uint64
}

/*
	получить список
*/
func (l Avto_list) Get() ([]Avto, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	querySQL := "SELECT avto_id,name,odo,avatar FROM cars.avto WHERE user_id=$1"
	rows, err := conn.Query(querySQL, l.User_id)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		avto_id uint64
		name    string
		odo     uint32
		avatar  string
	)
	var responce []Avto

	for rows.Next() {
		rows.Scan(&avto_id, &name, &odo, &avatar)

		responce = append(responce, Avto{
			Avto_id: avto_id,
			Name:    name,
			Odo:     odo,
			Avatar:  avatar == "Y",
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
	синхронизировать
*/
func (a *Avto) GetPublic() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql := "SELECT `name`,`odo`,`avatar`,`public` FROM `avto` WHERE `avto_id`=?"
	row := conn.QueryRow(query_sql, a.Avto_id)

	var (
		name   string
		odo    uint32
		avatar string
		public string
	)
	err = row.Scan(&name, &odo, &avatar, &public)
	if err != nil {
		return err
	}

	if public != "Y" {
		return errors.New("hidden")
	}

	a.Name = name
	a.Odo = odo
	a.Avatar = avatar == "Y"

	return nil
}

/*
	создание
*/
func (a *Avto) Create() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql := "INSERT INTO `avto` SET `name`=?,`odo`=?,`user_id`=?"
	result, err := conn.Exec(query_sql, a.Name, a.Odo, a.User_id)
	if err != nil {
		log.Println(err)
		return err
	}

	last_id, err := result.LastInsertId()
	if err != nil {
		log.Println(err)
		return err
	}

	a.Avto_id = uint64(last_id)

	return nil
}

/*
	изменение
*/
func (a *Avto) Update() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	err = a.checkOwn()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql_arr := []string{"UPDATE `avto` SET `name`=?,`odo`=?"}
	if a.Avatar {
		query_sql_arr = append(query_sql_arr, ",`avatar`='Y'")
	}
	query_sql_arr = append(query_sql_arr, " WHERE `avto_id`=?")

	_, err = conn.Exec(strings.Join(query_sql_arr, ""), a.Name, a.Odo, a.Avto_id)
	if err != nil {
		log.Println(err)
		return err
	}

	if !a.Avatar {
		row := conn.QueryRow("SELECT `avatar` FROM `avto` WHERE `avto_id`=?", a.Avto_id)
		var avatar string

		row.Scan(&avatar)
		a.Avatar = avatar == "Y"
	}

	return nil
}

/*
	удаление
*/
func (a Avto) Delete() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	err = a.checkOwn()
	if err != nil {
		log.Println(err)
		return err
	}

	tx, err := conn.Begin()
	if err != nil {
		log.Println(err)
		return err
	}

	query_sql := "DELETE FROM `avto` WHERE `avto_id`=?"
	_, err = tx.Exec(query_sql, a.Avto_id)
	if err != nil {
		log.Println(err)
		tx.Rollback()
		return err
	}

	query_sql = "DELETE FROM `services` WHERE `avto_id`=?"
	_, err = tx.Exec(query_sql, a.Avto_id)
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

func (a Avto) checkOwn() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query_sql := "SELECT `avto_id`,`user_id` FROM `avto` WHERE `avto_id`=?"
	row := conn.QueryRow(query_sql, a.Avto_id)

	var avto_id, user_id uint64

	row.Scan(&avto_id, &user_id)
	if avto_id == 0 {
		return errors.New("not found")
	}

	if a.User_id != user_id {
		log.Println("not the owner")
		return errors.New("not the owner")
	}

	return nil
}

func (a Avto) FileUpload(file multipart.File, handler *multipart.FileHeader) error {
	file_path := fmt.Sprintf("./fileuploads/src/%d_%s", a.Avto_id, handler.Filename)
	f, err := os.OpenFile(file_path, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer f.Close()
	io.Copy(f, file)

	cfg := config.GetInstance()

	// medium
	file_output_path_medium := fmt.Sprintf("./fileuploads/medium/%d.jpg", a.Avto_id)

	args := []string{file_path, "-resize", "240x240^", "-gravity", "center", "-extent", "240x240", file_output_path_medium}
	cmd := exec.Command(cfg.App.ImageMagick, args...)
	err = cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}

	// удалим большой временный файл
	os.Remove(file_path)

	// small
	file_output_path_small := fmt.Sprintf("./fileuploads/small/%d.jpg", a.Avto_id)
	args = []string{file_output_path_medium, "-resize", "60x60", file_output_path_small}
	cmd = exec.Command(cfg.App.ImageMagick, args...)
	err = cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/*
	Обновить пробег, если новый больше текущего
*/
func (a *Avto) SetODO(odo uint32) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query_sql := "SELECT `odo` FROM `avto` WHERE `avto_id`=?"
	row := conn.QueryRow(query_sql, a.Avto_id)

	var avto_odo uint32
	row.Scan(&avto_odo)

	if odo > avto_odo {
		query_sql = "UPDATE `avto` SET `odo`=? WHERE `avto_id`=?"
		_, err = conn.Exec(query_sql, odo, a.Avto_id)
		if err != nil {
			return err
		}
	}

	return nil
}
