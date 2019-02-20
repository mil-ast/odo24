package sendmail

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/mail"
	"net/smtp"
)

/*
	Настройки хоста
*/
type SendMail struct {
	Host     string
	Port     uint16
	Login    string
	Password string
}

/*
	Сообщение
*/
type Mail struct {
	From    string
	To      string
	Subject string
	Body    string
}

/*
	Отправка почты
*/
func (sm SendMail) Send(em Mail) error {
	from := mail.Address{Address: em.From}
	to := mail.Address{Address: em.To}

	headers := make(map[string]string)
	headers["From"] = from.String()
	headers["To"] = to.String()
	headers["Subject"] = em.Subject

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + em.Body

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

	_, err = w.Write([]byte(message))
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