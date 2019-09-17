package models

import (
	"regexp"
	"time"
)

type LoginFromBody struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func (l LoginFromBody) IsEmailValid() bool {
	re := regexp.MustCompile(`^[\w\-\.]+@[\w\-\.]+$`)
	return re.MatchString(l.Login)
}

type Profile struct {
	UserID    uint64    `json:"user_id"`
	Login     string    `json:"login"`
	Confirmed bool      `json:"confirmed,omitempty"`
	LastTime  time.Time `json:"-"`
}
