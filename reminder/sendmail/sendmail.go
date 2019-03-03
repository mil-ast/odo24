package sendmail

import (
	"io/ioutil"
	"sto/server/config"

	email "github.com/mil-ast/sendmail"
)

// Типы сообщений
const (
	TypeDocs uint8 = iota
	TypeInsurance
)

var templates map[uint8]string

func init() {
	templates = make(map[uint8]string)

	var (
		body []byte
		err  error
	)
	// TypeDocs
	body, err = ioutil.ReadFile("./sendmail/email_docs.eml")
	if err != nil {
		panic(err)
	}
	templates[TypeDocs] = string(body)

	// TypeInsurance
	body, err = ioutil.ReadFile("./sendmail/email_insurance.eml")
	if err != nil {
		panic(err)
	}
	templates[TypeInsurance] = string(body)
}

func GetClient() (email.Client, error) {
	options := config.GetInstance()

	host := email.Host{
		Host:     options.App.SmtpHost,
		Port:     options.App.SmtpPort,
		Login:    options.App.SmtpFrom,
		Password: options.App.SmtpPassword,
	}

	return email.NewClient(host)
}

func GetTemplate(tpl uint8) (string, bool) {
	body, ok := templates[tpl]
	return body, ok
}
