package models

import (
	"errors"
	"fmt"
	"log"
	"net/smtp"
	"sto/server/config"

	"github.com/mil-ast/db"
)

type ProfileRecovery struct {
	Email    string `json:"email,omitempty"`
	Code     uint32 `json:"code,omitempty"`
	Password string `json:"password,omitempty"`
}

func (r ProfileRecovery) CreateCode() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "select code from profiles.createrestorecode($1)"
	row := conn.QueryRow(sqlQuery, r.Email)

	var code uint16
	err = row.Scan(&code)
	if err != nil {
		return err
	}

	// отправка почты
	go func() {
		cfg := config.GetInstance()

		auth := smtp.PlainAuth("", cfg.App.SmtpFrom, cfg.App.SmtpPassword, cfg.App.SmtpHost)

		to := []string{r.Email}
		msg := []byte(fmt.Sprintf("To: %s\r\n"+
			"Subject: Восстановление пароля на Odometer.online\r\n"+
			"MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"+
			"\r\n"+
			"Для восстановления доступа к аккаунту введите в форму этот код подтверждения: <strong>%d</strong>\r\n", r.Email, code))

		err = smtp.SendMail(fmt.Sprintf("%s:%d", cfg.App.SmtpHost, cfg.App.SmtpPort), auth, cfg.App.SmtpFrom, to, msg)
		if err != nil {
			log.Println(err)
		}
	}()

	return nil
}

func (r ProfileRecovery) ConfirmCode() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "select * from profiles.checkrestorecode($1,$2)"
	row := conn.QueryRow(sqlQuery, r.Email, r.Code)

	var state bool
	err = row.Scan(&state)
	if err != nil {
		log.Println(err)
		return err
	}

	if !state {
		return errors.New("incorrect")
	}

	return nil
}

func (r ProfileRecovery) ResetPassword() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "call profiles.resetpassword($1,$2::bytea)"
	_, err = conn.Exec(sqlQuery, r.Email, r.Password)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
