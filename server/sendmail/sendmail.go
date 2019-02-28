package sendmail

import (
	"crypto/tls"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/mail"
	"net/smtp"
)

// Типы сообщений
const (
	TypeConfirmEmail uint8 = iota
	TypeRepairConfirmCode
)

// SendMail Настройки хоста
type SendMail struct {
	Host     string
	Port     uint16
	Login    string
	Password string
}

// Mail Сообщение
type Mail struct {
	From string
	To   string
}

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

// SendConfirmEmail подтверждениу почты
func (sm SendMail) SendEmail(em Mail, tpl uint8, code uint32) error {
	body, ok := templates[tpl]
	if !ok {
		return errors.New("Template not founc")
	}

	message := fmt.Sprintf(body, em.From, em.To, code)
	return sm.send(em, message)
}

func (sm SendMail) send(em Mail, body string) error {
	servername := fmt.Sprintf("%s:%d", sm.Host, sm.Port)
	host, _, _ := net.SplitHostPort(servername)

	auth := smtp.PlainAuth("", sm.Login, sm.Password, host)

	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         host,
	}
	conn, err := tls.Dial("tcp", servername, tlsconfig)
	if err != nil {
		return err
	}

	c, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}

	// Auth
	if err = c.Auth(auth); err != nil {
		return err
	}

	from := mail.Address{Address: em.From}
	to := mail.Address{Address: em.To}

	// To && From
	if err = c.Mail(from.Address); err != nil {
		return err
	}

	if err = c.Rcpt(to.Address); err != nil {
		return err
	}

	// Data
	w, err := c.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(body))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	c.Quit()
	return nil
}
