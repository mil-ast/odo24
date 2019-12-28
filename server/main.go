package main

import (
	"flag"
	"fmt"
	"log"
	"odo24/server/api"
	"odo24/server/config"
	"odo24/server/db"
	"odo24/server/sendmail"
	"odo24/server/sessions"
	"runtime"
)

// VERSION версия
var VERSION string = "2.1.0"

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
		}
	}()

	versionPtr := flag.Bool("version", false, "Print version")
	flag.Parse()

	fmt.Printf("Version: %s; %s\n", VERSION, runtime.Version())
	if *versionPtr == true {
		return
	}

	log.Println("Start...")
	log.SetFlags(log.Ldate | log.Ltime | log.Llongfile)

	// чтение настроек
	options := config.ReadConfig()

	fmt.Print("Create DB connection... ")
	err := db.CreateConnection(db.Options{
		DriverName:       options.Db.DriverName,
		ConnectionString: options.Db.ConnectionString,
		MaxIdleConns:     options.Db.MaxIdleConns,
		MaxOpenConns:     options.Db.MaxOpenConns,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("OK!")

	// ключ шифрования сессии
	sessions.SetSecretKey(options.App.SessionKey)

	// инициализация
	sendmail.InitSendmail()

	// инициализация API методов
	r := api.InitHandlers(options.Production)
	fmt.Printf("Addr: %s\r\n", options.App.ServerAddr)
	err = r.Run(options.App.ServerAddr)
	if err != nil {
		panic(err)
	}
}
