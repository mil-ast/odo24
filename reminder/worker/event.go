package worker

import (
	"errors"
	"fmt"
	"log"
	"sto/reminder/config"
	"sto/reminder/sendmail"

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
		event.send(client)
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
