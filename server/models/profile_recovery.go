package models

import (
	"errors"
	"log"
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

	var code uint32
	err = row.Scan(&code)
	if err != nil {
		return err
	}

	// отправка почты
	go func() {
		err := sendmail.SendEmail(r.Email, sendmail.TypeRepairConfirmCode, code)
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
