package config

import (
	"encoding/json"
	"io/ioutil"
)

const configFilName string = "config.json"

type Oauth struct {
	TokenURL     string `json:"TokenURL"`
	GrantType    string `json:"GrantType"`
	ClientID     string `json:"ClientID"`
	ClientSecret string `json:"ClientSecret"`
	RedirectURI  string `json:"RedirectURI"`
}

// Configuration структура конфига
type Configuration struct {
	Production bool `json:"production"`
	App        struct {
		ServerAddr   string `json:"server_addr"`
		ImageMagick  string `json:"imageMagick"`
		SMTPHost     string `json:"smtp_host"`
		SMTPPort     uint16 `json:"smtp_port"`
		SMTPFrom     string `json:"smtp_from"`
		SMTPPassword string `json:"smtp_password"`
		SessionKey   string `json:"session_key"`
	} `json:"app"`
	Db struct {
		DriverName       string `json:"driver_name"`
		ConnectionString string `json:"connection_string"`
		MaxIdleConns     int    `json:"max_idle_conns"`
		MaxOpenConns     int    `json:"max_open_conns"`
	} `json:"db"`
	Oauth struct {
		Google Oauth `json:"google"`
		MailRu Oauth `json:"mailru"`
		Yandex Oauth `json:"yandex"`
	} `json:"oauth"`
}

var cfg *Configuration

// ReadConfig чтение файла настроек
func ReadConfig() Configuration {
	cfg = new(Configuration)
	cfg.read()
	return *cfg
}

// GetInstance получить настройки
func GetInstance() Configuration {
	return *cfg
}

func (cfg *Configuration) read() {
	body, err := ioutil.ReadFile(configFilName)
	if err != nil {
		panic(err)
	}

	err = json.Unmarshal(body, &cfg)
	if err != nil {
		panic(err)
	}
}
