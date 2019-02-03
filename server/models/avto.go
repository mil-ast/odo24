package models

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"os/exec"
	"sto/server/config"

	"github.com/mil-ast/db"
)

type Avto struct {
	AvtoID uint64 `json:"avto_id"`
	Name   string `json:"name"`
	Odo    uint32 `json:"odo"`
	UserID uint64 `json:"user_id,omitempty"`
	Avatar bool   `json:"avatar"`
	Public bool   `json:"public,omitempty"`
}

type AvtoList struct {
	UserID uint64
}

/*
	получить список
*/
func (l AvtoList) Get() ([]Avto, error) {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return nil, err
	}

	querySQL := `SELECT avto_id,"name",odo,avatar FROM cars.avto WHERE user_id=$1`
	rows, err := conn.Query(querySQL, l.UserID)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var (
		avto_id uint64
		name    string
		odo     uint32
		avatar  bool
	)
	var responce []Avto

	for rows.Next() {
		rows.Scan(&avto_id, &name, &odo, &avatar)

		responce = append(responce, Avto{
			AvtoID: avto_id,
			Name:   name,
			Odo:    odo,
			Avatar: avatar,
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
	публичные авто
*/
func (a *Avto) GetPublic() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	querySQL := "SELECT name,odo,avatar,public FROM cars.avto WHERE avto_id=$1"
	row := conn.QueryRow(querySQL, a.AvtoID)

	var public bool
	err = row.Scan(&a.Name, &a.Odo, &a.Avatar, &public)
	if err != nil {
		return err
	}

	if !public {
		return errors.New("hidden")
	}

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

	querySQL := `SELECT avto_id,"name",odo,user_id,avatar,public FROM cars.createavto($1,$2,$3)`
	row := conn.QueryRow(querySQL, a.Name, a.Odo, a.UserID)

	var car Avto
	var public bool
	err = row.Scan(&a.AvtoID, &a.Name, &a.Odo, &car.UserID, &a.Avatar, &public)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
	}

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

	var paramAvatar sql.NullBool
	if a.Avatar {
		paramAvatar.Scan(a.Avatar)
	}

	querySQL := "select * from cars.updateavto($1,$2,$3,$4,$5,$6)"
	row := conn.QueryRow(querySQL, a.AvtoID, a.Odo, a.Name, a.UserID, paramAvatar, nil)

	var car Avto
	var public bool
	err = row.Scan(&car.AvtoID, &a.Name, &a.Odo, &car.UserID, &a.Avatar, &public)
	if err != nil && err != sql.ErrNoRows {
		log.Println(err)
		return err
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

	querySQL := "select cars.deleteavto($1,$2)"
	_, err = conn.Exec(querySQL, a.AvtoID, a.UserID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/*
	загрузка аватарки
*/
func (a Avto) FileUpload(file multipart.File, handler *multipart.FileHeader) error {
	filePath := fmt.Sprintf("./fileuploads/src/%d_%s", a.AvtoID, handler.Filename)
	f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer f.Close()
	io.Copy(f, file)

	cfg := config.GetInstance()

	// medium
	fileOutputPathMedium := fmt.Sprintf("./fileuploads/medium/%d.jpg", a.AvtoID)
	args := []string{filePath, "-resize", "240x240^", "-gravity", "center", "-extent", "240x240", fileOutputPathMedium}
	cmd := exec.Command(cfg.App.ImageMagick, args...)
	err = cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}

	// удалим большой временный файл
	os.Remove(filePath)

	// small
	fileOutputPathSmall := fmt.Sprintf("./fileuploads/small/%d.jpg", a.AvtoID)
	args = []string{fileOutputPathMedium, "-resize", "60x60", fileOutputPathSmall}
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

	querySQL := "select cars.setAvtoOdo($1,$2)"
	_, err = conn.Exec(querySQL, a.AvtoID, odo, a.UserID)
	if err != nil {
		log.Println(err)
	}

	return nil
}
