package sendmail

import (
	"bytes"
	"fmt"
	"html/template"
	"io/ioutil"
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

// InitSendmail инициализация почтовика
func InitSendmail() {
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

	client, err := email.NewClient(email.Options{
		Host:     options.SMTP.Host,
		Port:     options.SMTP.Port,
		Login:    options.SMTP.From,
		Password: options.SMTP.Password,
	})
	if err != nil {
		return err
	}

	templateBody = fmt.Sprintf(templateBody, options.SMTP.From, to)

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("letter").Parse(templateBody))
	err = t.Execute(buffer, params)
	if err != nil {
		return err
	}

	err = client.Send(options.SMTP.From, to, buffer.String())
	if err != nil {
		return err
	}

	return client.Quit()
}
