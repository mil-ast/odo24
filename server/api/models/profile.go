package models

import (
	"regexp"
	"time"
)

const RegExpEmail = `^[\w\-\.]+@[\w\-\.]+$`

type LoginFromBody struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type RegisterLoginFromBody struct {
	Login string `json:"login"`
}

func (l LoginFromBody) IsEmailValid() bool {
	re := regexp.MustCompile(RegExpEmail)
	return re.MatchString(l.Login)
}

func (l RegisterLoginFromBody) IsEmailValid() bool {
	re := regexp.MustCompile(RegExpEmail)
	return re.MatchString(l.Login)
}

type Profile struct {
	UserID    uint64    `json:"user_id"`
	Login     string    `json:"login"`
	Confirmed bool      `json:"confirmed,omitempty"`
	LastTime  time.Time `json:"-"`
}
