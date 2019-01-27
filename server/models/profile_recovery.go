package models

import (
	"fmt"
	"log"
	"net/smtp"
	"sto/server/config"

	"github.com/mil-ast/db"
)

type ProfileEmail struct {
	Email string `json:"email"`
}

func (r ProfileEmail) CreateCode() error {
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
