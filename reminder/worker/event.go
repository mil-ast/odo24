package worker

import (
	"errors"
	"fmt"
	"log"
	"sto/reminder/config"
	"sto/reminder/sendmail"

	"github.com/mil-ast/db"
	email "github.com/mil-ast/sendmail"
)

type Event struct {
	ID        uint64
	EventType string
	DateStart string
	DateEnd   string
	AvtoID    uint64
	Email     string
	CarName   string
}

type EventList struct {
	List []Event
}

func (list EventList) Send() error {
	if len(list.List) == 0 {
		return nil
	}

	client, err := sendmail.GetClient()
	if err != nil {
		return err
	}

	for _, event := range list.List {
		err = event.send(client)
		if err != nil {
			log.Println(err)
			continue
		}

		event.comlete()
		if err != nil {
			log.Println(err)
		}
	}

	err = client.Quit()
	if err != nil {
		log.Println(err)
	}

	return nil
}

// send
func (event Event) send(client email.Client) error {
	options := config.GetInstance()

	var tpl uint8
	if event.EventType == "docs" {
		tpl = sendmail.TypeDocs
	} else {
		tpl = sendmail.TypeInsurance
	}

	body, ok := sendmail.GetTemplate(tpl)
	if !ok {
		return errors.New("Template not founc")
	}

	var message string

	if event.EventType == "docs" {
		message = fmt.Sprintf(body, options.App.SmtpFrom, event.Email, event.DateEnd)
	} else {
		message = fmt.Sprintf(body, options.App.SmtpFrom, event.Email, event.CarName, event.DateEnd)
	}

	return client.Send(options.App.SmtpFrom, event.Email, message)
}

// send
func (event Event) comlete() error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	_, err = conn.Exec("update reminding.reminding set is_closed=true where id=$1", event.ID)
	return err
}
