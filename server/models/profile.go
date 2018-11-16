package models

import (
	"bytes"
	"crypto/sha256"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/smtp"
	"sto/server/config"
	"strings"
	"time"

	"github.com/mil-ast/db"
)

type AuthStates struct {
	Fail    bool
	Version string
}

type Profile struct {
	User_id   uint64 `json:"user_id"`
	Login     string `json:"login,omitempty"`
	Phone     uint64 `json:"phone,omitempty"`
	Time_zone int8   `json:"time_zone"`
	Password  string `json:"password,omitempty"`
	Code      uint32 `json:"code,omitempty"`
}

/*
	авторизация
*/
func (this *Profile) Auth() error {
	if this.Password == "" {
		return errors.New("no password is set")
	}
	if this.Login == "" {
		return errors.New("login is not specified")
	}

	h := sha256.New()
	h.Write([]byte(this.Password))
	byte_hash := h.Sum(nil)

	// очищаем пароль
	this.Password = ""

	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	var query_sql string = "SELECT `user_id`,`password_hash`,`phone`,`time_zone` FROM `users` WHERE `login`=?"
	row := conn.QueryRow(query_sql, this.Login)

	var query_hash []byte
	var null_phone sql.NullInt64

	err = row.Scan(&this.User_id, &query_hash, &null_phone, &this.Time_zone)
	if err != nil {
		return errors.New("incorrect login")
	}

	if this.User_id == 0 {
		return errors.New("user is not exists")
	}

	if bytes.Compare(query_hash, byte_hash) != 0 {
		return errors.New("incorrect password")
	}

	if null_phone.Int64 != 0 {
		this.Phone = uint64(null_phone.Int64)
	}

	query_sql = "UPDATE `users` SET `last accessed`=? WHERE `user_id`=?"
	go conn.Exec(query_sql, time.Now().Format("2006-01-02"), this.User_id)

	return nil
}

/*
	подтверждение почты
*/
func (p Profile) ConfirmEmail() error {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	// проверим существование талого логина
	querySQL := "SELECT COUNT(`user_id`) as `cnt` FROM `users` WHERE `login`=?"
	row := conn.QueryRow(querySQL, p.Login)
	var cnt uint64
	row.Scan(&cnt)

	if cnt > 0 {
		return errors.New("login is exists")
	}

	var min int = 10000
	var max int = 999999
	var random int = min + rand.Intn(max-min)

	cfg := config.GetInstance()

	// отправка почты
	go func() {
		auth := smtp.PlainAuth("", cfg.App.SmtpFrom, cfg.App.SmtpPassword, cfg.App.SmtpHost)

		to := []string{p.Login}
		msg := []byte(fmt.Sprintf("To: %s\r\n"+
			"Subject: Подтверждение почты для регистрации на Odometer.online\r\n"+
			"\r\n"+
			"Код подтверждения %d\r\n", p.Login, random))

		err = smtp.SendMail(fmt.Sprintf("%s:%d", cfg.App.SmtpHost, cfg.App.SmtpPort), auth, cfg.App.SmtpFrom, to, msg)
		if err != nil {
			log.Println(err)
		}
	}()

	// удалим старые записи
	go func() {
		querySQL := "DELETE FROM `users_confirm` WHERE `time_update`>?"
		_, err = conn.Exec(querySQL, time.Now().Add(-5*time.Minute).Format("2006-01-02 15:04:05"))
		if err != nil {
			log.Println(err)
		}
	}()

	querySQL = "REPLACE INTO `users_confirm` SET `value`=?,`type`=?,`code`=?,`time_update`=?"
	_, err = conn.Exec(querySQL, p.Login, "EMAIL", random, time.Now().Format("2006-01-02 15:04:05"))
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

/*
	регистрация
*/
func (p *Profile) Register() error {
	if p.Password == "" {
		return errors.New("no password is set")
	}
	if p.Login == "" {
		return errors.New("login is not specified")
	}

	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return err
	}

	// проверим валидность кода подтверждения
	querySQL := "SELECT `code` FROM `users_confirm` WHERE `value`=? AND `type`=?"
	row := conn.QueryRow(querySQL, p.Login, "EMAIL")

	var code uint32
	row.Scan(&code)
	if code == 0 {
		return errors.New("code is empty")
	}
	if code != p.Code {
		return errors.New("codes do not match")
	}

	h := sha256.New()
	h.Write([]byte(p.Password))
	byteHash := h.Sum(nil)

	// очистим пароль
	p.Password = ""
	p.Time_zone = 10
	p.Code = 0

	querySQL = "INSERT INTO `users` SET `login`=?,`password_hash`=?,`time_zone`=?,`last accessed`=?"
	result, err := conn.Exec(querySQL, p.Login, byteHash, p.Time_zone, time.Now().Format("2006-01-02"))
	if err != nil {
		log.Println(err)
		return err
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		log.Println(err)
		return err
	}

	p.User_id = uint64(lastID)

	return nil
}

/**
Выход из профиля
*/
func (p Profile) Logout() {}

/**
	сохранить профиль
**/
func (p *Profile) Save(password string) error {
	var (
		query_sql     string = "UPDATE `users` SET %s WHERE `user_id`=?"
		query_sql_arr []string
		params        []interface{}
	)

	if password != "" {
		h := sha256.New()
		h.Write([]byte(password))

		query_sql_arr = append(query_sql_arr, "`password_hash`=?")
		params = append(params, h.Sum(nil))
	}

	if len(params) == 0 {
		return nil
	}

	params = append(params, p.User_id)

	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	_, err = conn.Exec(fmt.Sprintf(query_sql, strings.Join(query_sql_arr, ",")), params...)
	if err != nil {
		return err
	}

	return nil
}
