package reminder

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/smtp"
	"sto/server/config"
	"strconv"
	"strings"
	"time"

	"github.com/mil-ast/db"
)

const (
	INTERVAL        = time.Hour
	QUERYSQL string = "SELECT `id`,`event_type`,`date_end`,`event_before`,`login` FROM Reminding"
)
const (
	TPL_EMAIL_INSURANCE string = "email_insurance.tpl"
	TPL_EMAIL_DOC       string = "email_doc.tpl"
)

var templates map[string]string = make(map[string]string)

/*
	инициализация
*/
func Start() {
	loadTemplates()

	exec()
	tick := time.NewTicker(INTERVAL)
	for {
		<-tick.C
		exec()
	}
}

func exec() {
	conn, err := db.GetConnection()
	if err != nil {
		log.Println(err)
		return
	}

	rows, err := conn.Query(QUERYSQL)
	if err != nil {
		log.Println(err)
		return
	}

	var (
		id          uint64
		dateEnd     string
		eventType   string
		eventBefore uint16
		login       string
	)
	var successIDS []string

	for rows.Next() {
		rows.Scan(&id, &eventType, &dateEnd, &eventBefore, &login)
		// отправка уведомления
		err = send(id, eventType, dateEnd, eventBefore, login)
		if err != nil {
			log.Println(err)
			break
		}

		successIDS = append(successIDS, strconv.FormatUint(id, 10))
	}
	rows.Close()

	err = rows.Err()
	if err != nil {
		log.Println(err)
	}

	// если нет записей, выходим
	if len(successIDS) == 0 {
		return
	}

	// обновляем успешные записи
	querySQL := fmt.Sprintf("UPDATE `reminding` SET `closed`='Y' WHERE `id` IN(%s)", strings.Join(successIDS, ","))
	_, err = conn.Exec(querySQL)
	if err != nil {
		log.Println(err)
	}
}

/*
	отправка напоминания
*/
func send(id uint64, eventType, dateEnd string, eventBefore uint16, login string) error {
	cfg := config.GetInstance()

	auth := smtp.PlainAuth("", cfg.App.SmtpFrom, cfg.App.SmtpPassword, cfg.App.SmtpHost)
	to := []string{login}

	var (
		tpl string
		ok  bool
	)
	switch eventType {
	case "insurance":
		tpl, ok = templates[TPL_EMAIL_INSURANCE]
	case "docs":
		tpl, ok = templates[TPL_EMAIL_DOC]
	}

	if !ok {
		return nil
	}

	msg := []byte(fmt.Sprintf(tpl, login, dateEnd))

	err := smtp.SendMail(fmt.Sprintf("%s:%d", cfg.App.SmtpHost, cfg.App.SmtpPort), auth, cfg.App.SmtpFrom, to, msg)
	if err != nil {
		return err
	}

	return nil
}

func loadTemplates() error {
	var tplList []string = []string{TPL_EMAIL_INSURANCE, TPL_EMAIL_DOC}
	var (
		body []byte
		err  error
	)

	for i := 0; i < len(tplList); i++ {
		body, err = ioutil.ReadFile(fmt.Sprintf("./reminder/%s", tplList[i]))
		if err != nil {
			return err
		}

		templates[tplList[i]] = string(body)
	}

	return nil
}
