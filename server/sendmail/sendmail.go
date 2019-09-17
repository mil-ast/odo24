package sendmail

import (
	"errors"
	"fmt"
	"io/ioutil"
	"odo24/server/config"

	email "github.com/mil-ast/sendmail"
)

// Типы сообщений
const (
	TypeConfirmEmail uint8 = iota
	TypeRepairConfirmCode
)

var templates map[uint8]string

func init() {
	templates = make(map[uint8]string)

	var (
		body []byte
		err  error
	)
	// TypeConfirmEmail
	body, err = ioutil.ReadFile("./sendmail/confirm_email.eml")
	if err != nil {
		panic(err)
	}
	templates[TypeConfirmEmail] = string(body)

	// TypeRepairConfirmCode
	body, err = ioutil.ReadFile("./sendmail/confirm_repair_code.eml")
	if err != nil {
		panic(err)
	}
	templates[TypeRepairConfirmCode] = string(body)
}

// SendEmail
func SendEmail(to string, tpl uint8, code uint32) error {
	body, ok := templates[tpl]
	if !ok {
		return errors.New("Template not founc")
	}

	options := config.GetInstance()

	host := email.Host{
		Host:     options.App.SmtpHost,
		Port:     options.App.SmtpPort,
		Login:    options.App.SmtpFrom,
		Password: options.App.SmtpPassword,
	}

	client, err := email.NewClient(host)
	if err != nil {
		return err
	}

	message := fmt.Sprintf(body, options.App.SmtpFrom, to, code)
	err = client.Send(options.App.SmtpFrom, to, message)
	if err != nil {
		return err
	}

	return client.Quit()
}
