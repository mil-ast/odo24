package models

import (
	"errors"
	"fmt"
	"log"
	"sto/server/config"
	"sto/server/sendmail"

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

		host := sendmail.SendMail{
			Host:     cfg.App.SmtpHost,
			Port:     cfg.App.SmtpPort,
			Login:    cfg.App.SmtpFrom,
			Password: cfg.App.SmtpPassword,
		}

		body := fmt.Sprintf(
			"<p>Для восстановления доступа к аккаунту введите в форму этот код подтверждения: <strong>%d</strong></p>"+
				"<p>С уважением, команда <a href=\"https://odo24.ru\">odo24.ru</a></p>"+
				"<p>По всем вопросам пишите на %s",
			code,
			cfg.App.SmtpFrom,
		)

		mail := sendmail.Mail{
			From:    cfg.App.SmtpFrom,
			To:      r.Email,
			Subject: "Восстановление пароля на odo24.ru",
			Body:    body,
		}

		err := host.Send(mail)
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
