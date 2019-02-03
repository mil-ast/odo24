package models

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"log"
	"net/smtp"
	"sto/server/config"
	"strings"

	"github.com/mil-ast/db"
)

type Profile struct {
	User_id       uint64 `json:"user_id"`
	Login         string `json:"login,omitempty"`
	Phone         uint64 `json:"phone,omitempty"`
	Time_zone     int8   `json:"time_zone,omitempty"`
	IsNoConfirmed bool   `json:"is_no_confirmed,omitempty"`
	Password      string `json:"password,omitempty"`
	Code          uint32 `json:"code,omitempty"`
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

	sqlQuery := "select user_id,login,is_no_confirmed from profiles.login($1, $2::bytea);"
	row := conn.QueryRow(sqlQuery, p.Login, p.Password)
	err = row.Scan(&p.User_id, &p.Login, &p.IsNoConfirmed)

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

/*
	отправка кода для подтверждения почты
*/
func (p *Profile) ConfirmEmail() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "select code from profiles.createrestorecode($1)"
	row := conn.QueryRow(sqlQuery, p.Login)

	var code uint16
	err = row.Scan(&code)
	if err != nil {
		return err
	}

	// отправка почты
	go func() {
		cfg := config.GetInstance()

		auth := smtp.PlainAuth("", cfg.App.SmtpFrom, cfg.App.SmtpPassword, cfg.App.SmtpHost)

		to := []string{p.Login}
		msg := []byte(fmt.Sprintf("To: %s\r\n"+
			"Subject: Подтверждение почты на Odometer.online\r\n"+
			"MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"+
			"\r\n"+
			"Для подтверждения текущего E-mail введите в форму на сайте этот код подтверждения: <strong>%d</strong>\r\n", p.Login, code))

		err = smtp.SendMail(fmt.Sprintf("%s:%d", cfg.App.SmtpHost, cfg.App.SmtpPort), auth, cfg.App.SmtpFrom, to, msg)
		if err != nil {
			log.Println(err)
		}
	}()

	return nil
}

func (p Profile) ConfirmCode() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "select * from profiles.checkrestorecode($1,$2)"
	row := conn.QueryRow(sqlQuery, p.Login, p.Code)

	var state bool
	err = row.Scan(&state)
	if err != nil {
		log.Println(err)
		return err
	}

	if !state {
		return errors.New("incorrect")
	}

	sqlQuery = "delete from profiles.restore r where r.user_id=$1"
	_, err = conn.Exec(sqlQuery, p.User_id)
	if err != nil {
		log.Println(err)
		return err
	}

	sqlQuery = "update profiles.users set confirmed=true where user_id=$1"
	_, err = conn.Exec(sqlQuery, p.User_id)
	if err != nil {
		log.Println(err)
		return err
	}
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

/**
	изменить пароль
**/
func (p Profile) UpdatePassword() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	querySQL := "call profiles.updatepassword($1,$2::bytea) "
	_, err = conn.Exec(querySQL, p.User_id, p.Password)
	if err != nil {
		return err
	}

	return nil
}
