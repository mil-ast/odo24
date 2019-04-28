package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

const CONFIG_FILE_NAME string = "config.json"

type Configuration struct {
	App struct {
		Version       string
		Server_addr   string `json:"server_addr"`
		ImageMagick   string `json:"imageMagick"`
		SmtpHost      string `json:"smtp_host"`
		SmtpPort      uint16 `json:"smtp_port"`
		SmtpFrom      string `json:"smtp_from"`
		SmtpPassword  string `json:"smtp_password"`
		MemcachedAddr string `json:"memcached_addr"`
	}
	Db struct {
		Driver_name, Name, Data_source, Timeout string
		Max_idle_conns                          int
		Max_open_conns                          int
	}
}

var cfg *Configuration

func init() {
	cfg = new(Configuration)
	cfg.read()
}

func GetInstance() *Configuration {
	return cfg
}

func (cfg *Configuration) read() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("Configuration error:", err)
		}
	}()

	// чтение и парсинг файла настроек
	body, err := ioutil.ReadFile(CONFIG_FILE_NAME)
	if err != nil {
		panic(err)
	}

	err = json.Unmarshal(body, &cfg)
	if err != nil {
		panic(err)
	}
}
