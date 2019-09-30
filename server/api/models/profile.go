package models

import (
	"regexp"
	"time"
)

const RegExpEmail = `^[\w\-\.]+@[\w\-\.]+$`

type Login struct {
	Login string `json:"login" binding:"required"`
}

type LoginFromBody struct {
	Login
	Password string `json:"password"`
}

type RegisterConfirmEmailFromBody struct {
	Login
	Code    *uint32 `json:"code"`
	LinkKey *string `json:"link_key"`
}

func (l Login) IsEmailValid() bool {
	re := regexp.MustCompile(RegExpEmail)
	return re.MatchString(l.Login)
}

type Profile struct {
	UserID    uint64    `json:"user_id"`
	Login     string    `json:"login"`
	Confirmed bool      `json:"confirmed,omitempty"`
	LastTime  time.Time `json:"-"`
}
