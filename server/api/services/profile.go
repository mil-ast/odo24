package services

import (
	"context"
	"errors"
	"log"
	"odo24/server/api/models"
	"odo24/server/db"
	"odo24/server/sendmail"
	"odo24/server/utils"
	"time"
)

type ProfileService struct{}

// NewProfileService экземпляр сервис Профиля
func NewProfileService() ProfileService {
	return ProfileService{}
}

func (ProfileService) GetProfile(userID uint64) (*models.Profile, error) {
	conn := db.Conn()

	profile := new(models.Profile)
	sqlQuery := "select user_id,login,confirmed from profiles.get_profile($1);"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, userID)
	err = row.Scan(&profile.UserID, &profile.Login, &profile.Confirmed)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

// Login авторизация
func (ProfileService) Login(login models.Email, password models.Password) (*models.Profile, error) {
	conn := db.Conn()

	profile := new(models.Profile)

	sqlQuery := "select user_id,login,confirmed from profiles.login($1, $2::bytea);"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, login, password)
	err = row.Scan(&profile.UserID, &profile.Login, &profile.Confirmed)
	if err != nil {
		return nil, err
	}

	if profile.UserID == 0 {
		return nil, errors.New("user is not exists")
	}

	return profile, nil
}

// Register регистрация
func (ProfileService) Register(login models.Email) error {
	conn := db.Conn()

	code := utils.GenerateRandomNumber(10000, 99999)
	linkKey := utils.GenerateRandomString(32)

	sqlQuery := "SELECT FROM profiles.register($1, $2, $3::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	_, err = conn.ExecContext(ctx, sqlQuery, login, code, linkKey)
	if err != nil {
		return err
	}

	go func() {
		letter := make(map[string]interface{}, 2)
		letter["login"] = login
		letter["code"] = code

		err := sendmail.SendEmail(string(login), sendmail.TypeConfirmEmail, letter)
		if err != nil {
			log.Println(err)
		}
	}()
	return nil
}

// PasswordRecovery восстановление пароля
func (ProfileService) PasswordRecovery(login models.Email) error {
	conn := db.Conn()

	code := utils.GenerateRandomNumber(10000, 99999)
	linkKey := utils.GenerateRandomString(32)

	sqlQuery := "SELECT FROM profiles.password_recovery($1, $2, $3::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	_, err = conn.ExecContext(ctx, sqlQuery, login, code, linkKey)
	return err
}

// PasswordUpdate изменение пароля из личного кабинета
func (ProfileService) PasswordUpdate(userID uint64, password models.Password) error {
	conn := db.Conn()

	sqlQuery := "SELECT * FROM profiles.password_update($1, $2::bytea)"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	_, err = conn.ExecContext(ctx, sqlQuery, userID, password)
	return err
}

// ResetPassword сброс пароля
func (ProfileService) ResetPassword(login models.Email, password models.Password, code *uint32, linkKey *string) error {
	conn := db.Conn()

	sqlQuery := "SELECT reset_password ok FROM profiles.reset_password($1, $2::bytea, $3, $4::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, login, password, code, linkKey)

	var isOk bool
	err = row.Scan(&isOk)
	if err != nil {
		return err
	}

	if !isOk {
		return errors.New("incorrect")
	}
	return nil
}
