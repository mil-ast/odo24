package models

import (
	"crypto/sha256"
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
	Time_zone int8   `json:"time_zone,omitempty"`
	Password  string `json:"password,omitempty"`
	Code      uint32 `json:"code,omitempty"`
}

/*
	авторизация
*/
func (p *Profile) Auth() error {
	if p.Password == "" {
		return errors.New("no password is set")
	}
	if p.Login == "" {
		return errors.New("login is not specified")
	}

	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "select user_id,login from profiles.login($1, $2::bytea);"
	row := conn.QueryRow(sqlQuery, p.Login, p.Password)
	err = row.Scan(&p.User_id, &p.Login)

	// очистим пароль чтобы не возвращать на клиент
	p.Password = ""

	if err != nil {
		switch err.Error() {
		case "user not found", "password error":
			return errors.New("incorrect login/password")
		default:
			log.Println(err)
			return err
		}
	}

	if p.User_id == 0 {
		return errors.New("user is not exists")
	}

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

	password := p.Password
	p.Password = ""

	querySQL := "select * from profiles.register($1,$2)"
	row := conn.QueryRow(querySQL, p.Login, password)
	err = row.Scan(&p.User_id, &p.Login)

	return err
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
