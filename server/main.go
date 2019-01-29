package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"sto/server/config"
	"sto/server/handlers"

	//"sto/server/reminder"
	"syscall"
	"time"

	"github.com/mil-ast/db"
	"github.com/mil-ast/sessions"
)

var VERSION string = "1/0"

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Fatal(err)
		}
	}()

	boolPtr := flag.Bool("version", false, "Get version")
	flag.Parse()

	fmt.Printf("Version: %s; %s\n", VERSION, runtime.Version())
	if *boolPtr == true {
		return
	}

	log.Println("Start...")
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	// чтение настроек
	options := config.GetInstance()
	options.App.Version = VERSION

	log.Print("Create DB connection... ")
	_, err := db.CreateConnection(db.Options{
		DriverName:     options.Db.Driver_name,
		DataSourceName: options.Db.Data_source,
		DbName:         options.Db.Name,
		Timeout:        options.Db.Timeout,
		MaxIdleConns:   options.Db.Max_idle_conns,
		MaxOpenConns:   options.Db.Max_open_conns,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("OK!")

	// запуск сервиса напоминаний
	// go reminder.Start()

	// актуальность сессии
	sessions.SetMaxLifeTime(time.Minute * 20)

	// профиль
	http.HandleFunc("/api/register/confirm", handlers.ProfileConfirmEmail)
	http.HandleFunc("/api/register", handlers.Profile_register)
	http.HandleFunc("/api/profile/login", handlers.ProfileLogin)
	http.HandleFunc("/api/profile/logout", handlers.ProfileLogout)
	http.HandleFunc("/api/profile/recovery", handlers.ProfileRecovery)
	http.HandleFunc("/api/profile/confirm_code", handlers.ProfileRecoveryConfirmCode)
	http.HandleFunc("/api/profile/reset_password", handlers.ProfileRecoveryResetPassword)
	http.HandleFunc("/api/profile", handlers.Profile)
	// авто
	http.HandleFunc("/api/avto", handlers.Avto)
	//http.HandleFunc("/api/avto/public/", handlers.AvtoPublic)
	// группы
	http.HandleFunc("/api/groups", handlers.Groups)
	http.HandleFunc("/api/groups/stats", handlers.GroupsStats)
	//http.HandleFunc("/api/groups/public/", handlers.GroupsPublic)
	// сервисы
	http.HandleFunc("/api/services", handlers.Services)
	//http.HandleFunc("/api/services/public/", handlers.ServicesPublic)
	// напоминания
	//http.HandleFunc("/api/reminding", handlers.Reminding)
	// фото авто
	http.HandleFunc("/api/images/", handlers.Images)

	if options.App.Server_addr == "" {
		options.App.Server_addr = "0.0.0.0:8080"
	}

	fmt.Printf("Addr: http://%s\r\n", options.App.Server_addr)

	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)

	go func() {
		s := <-sigc

		log.SetFlags(log.Ldate | log.Ltime)
		log.Println("\r\nThe WEB-server is stopped. Signal:", s)
		os.Exit(1)
	}()

	s := &http.Server{
		Addr:           options.App.Server_addr,
		ReadTimeout:    20 * time.Second,
		WriteTimeout:   20 * time.Second,
		MaxHeaderBytes: 1 << 16, // 64mb,
	}

	log.Fatal(s.ListenAndServe())
}
