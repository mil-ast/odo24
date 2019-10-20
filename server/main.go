package main

import (
	"flag"
	"fmt"
	"log"
	"odo24/server/api/binders"
	"odo24/server/api/handlers"
	"odo24/server/config"
	"odo24/server/sessions"
	"runtime"

	"github.com/gin-gonic/gin"
	"github.com/mil-ast/db"
)

var VERSION string = "2.0.0"

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
		MaxIdleConns:   options.Db.Max_idle_conns,
		MaxOpenConns:   options.Db.Max_open_conns,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("OK!")

	// ключ шифрования сессии
	sessions.SetSecretKey(options.App.SessionKey)

	gin.SetMode(gin.DebugMode) // gin.ReleaseMode
	r := gin.Default()

	// Профиль
	profileGroup := r.Group("/api/profile")
	{
		profileGroup.GET("", binders.GetSession, handlers.ProfileGet)
		profileGroup.POST("/login", handlers.CheckUserAgent, handlers.Login)
		profileGroup.GET("/oauth", binders.GetOauthParamsFromQuery, handlers.OAuth)
		profileGroup.GET("/logout", handlers.Logout)
		profileGroup.POST("/register", handlers.CheckUserAgent, handlers.Register)
		profileGroup.POST("/reset_password", handlers.CheckUserAgent, handlers.ResetPassword)
		profileGroup.POST("/password_recovery", handlers.CheckUserAgent, handlers.PasswordRecovery)
		profileGroup.POST("/update_password", binders.GetSession, handlers.PasswordUpdate)
	}

	// Авто
	AvtoGroup := r.Group("/api/avto")
	{
		AvtoGroup.GET("/", binders.GetSession, handlers.AvtoGetAll)
	}

	if options.App.Server_addr == "" {
		options.App.Server_addr = "127.0.0.1:8080"
	}

	fmt.Printf("Addr: %s\r\n", options.App.Server_addr)
	err = r.Run(options.App.Server_addr)
	if err != nil {
		panic(err)
	}

	// профиль
	/*http.HandleFunc("/api/register", handlers.Profile_register)
	http.HandleFunc("/api/profile/login", handlers.ProfileLogin)
	http.HandleFunc("/api/profile/oauth", handlers.OAuth)
	http.HandleFunc("/api/profile/logout", handlers.ProfileLogout)
	http.HandleFunc("/api/profile/recovery", handlers.ProfileRecovery)
	http.HandleFunc("/api/profile/confirm_code", handlers.ProfileRecoveryConfirmCode)
	http.HandleFunc("/api/profile/check_code", handlers.ProfileConfirmCode)
	http.HandleFunc("/api/profile/reset_password", handlers.ProfileRecoveryResetPassword)
	http.HandleFunc("/api/profile/update_password", handlers.ProfileUpdatePassword)
	http.HandleFunc("/api/profile/confirm_email", handlers.ProfileConfirmEmail)
	http.HandleFunc("/api/profile", handlers.Profile)
	// авто
	http.HandleFunc("/api/avto", handlers.Avto)
	// группы
	http.HandleFunc("/api/groups", handlers.Groups)
	// сервисы
	http.HandleFunc("/api/services", handlers.Services)
	// документы
	http.HandleFunc("/api/documents", handlers.Documents)
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

	log.Fatal(s.ListenAndServe())*/
}
