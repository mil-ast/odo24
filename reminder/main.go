package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"sto/reminder/config"
	"sto/reminder/worker"
	"syscall"

	"github.com/mil-ast/db"
)

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Fatal(err)
		}
	}()

	// чтение настроек
	options := config.GetInstance()

	log.Print("Create DB connection... ")
	conn, err := db.CreateConnection(db.Options{
		DriverName:     options.Db.Driver_name,
		DataSourceName: options.Db.Data_source,
		DbName:         options.Db.Name,
		MaxIdleConns:   options.Db.Max_idle_conns,
		MaxOpenConns:   options.Db.Max_open_conns,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("OK!")

	worker.Start(conn)

	log.SetFlags(log.Ldate | log.Ltime)

	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)

	s := <-sigc
	log.Println("\r\nStop. Signal:", s.String())
	os.Exit(1)
}
