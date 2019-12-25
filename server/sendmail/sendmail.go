package sendmail

import (
	"bytes"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"odo24/server/config"

	email "github.com/mil-ast/sendmail"
)

// Типы сообщений
const (
	TypeConfirmEmail uint8 = iota
	TypeRepairConfirmCode
	TypeRegisterFromOAUTH
)

var templates map[uint8]string

func init() {
	templates = make(map[uint8]string)

	files := map[uint8]string{
		TypeConfirmEmail:      "confirm_email",
		TypeRepairConfirmCode: "confirm_repair_code",
		TypeRegisterFromOAUTH: "oauth_register",
	}

	var (
		body []byte
		err  error
	)

	for index, fileName := range files {
		body, err = ioutil.ReadFile(fmt.Sprintf("./sendmail/%s.eml", fileName))
		if err != nil {
			panic(err)
		}
		templates[index] = string(body)
	}
}

// SendEmail отправка
func SendEmail(to string, tplID uint8, params map[string]interface{}) error {
	templateBody, ok := templates[tplID]
	if !ok {
		return fmt.Errorf("Template %d not found", tplID)
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

	templateBody = fmt.Sprintf(templateBody, options.App.SmtpFrom, to)

	log.Println(777, templateBody)

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("letter").Parse(templateBody))
	err = t.Execute(buffer, params)
	if err != nil {
		return err
	}

	err = client.Send(options.App.SmtpFrom, to, buffer.String())
	if err != nil {
		return err
	}

	return client.Quit()
}
