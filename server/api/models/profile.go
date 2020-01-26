package models

import (
	"regexp"
)

const regExpEmail = `^[\w\-\.]+@[\w\-\.]+$`

// Email логин
type Email string

// IsEmailValid валидация емейла
func (e Email) IsEmailValid() bool {
	if len(e) < 6 {
		return false
	}

	re := regexp.MustCompile(regExpEmail)
	return re.MatchString(string(e))
}

// Password строка пароля
type Password string

// IsValid валидация пароля
func (p Password) IsValid() bool {
	return len(p) > 3
}

type EmailFromBody struct {
	Email Email `json:"login" binding:"required"`
}

type LoginFromBody struct {
	Login    Email    `json:"login" binding:"required"`
	Password Password `json:"password"`
}

type RegisterResetPasswordFromBody struct {
	Login    Email    `json:"login" binding:"required"`
	Code     *uint32  `json:"code"`
	LinkKey  *string  `json:"link_key"`
	Password Password `json:"password"`
}

type Profile struct {
	UserID    uint64 `json:"user_id"`
	Login     Email  `json:"login"`
	Confirmed bool   `json:"confirmed,omitempty"`
}

type PasswordFromBody struct {
	Password Password `json:"password"`
}
