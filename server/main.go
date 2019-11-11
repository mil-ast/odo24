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
	log.SetFlags(log.Ldate | log.Ltime | log.Llongfile)

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

	if options.Production {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.Default()

	// Профиль
	profileGroup := r.Group("/api/profile")
	profileCtrl := handlers.NewProfileController()
	{
		profileGroup.GET("", binders.GetSession, profileCtrl.ProfileGet)
		profileGroup.POST("/login", handlers.CheckUserAgent, profileCtrl.Login)
		profileGroup.GET("/oauth", binders.GetOauthParamsFromQuery, profileCtrl.OAuth)
		profileGroup.GET("/logout", profileCtrl.Logout)
		profileGroup.POST("/register", handlers.CheckUserAgent, profileCtrl.Register)
		profileGroup.POST("/reset_password", handlers.CheckUserAgent, profileCtrl.ResetPassword)
		profileGroup.POST("/password_recovery", handlers.CheckUserAgent, profileCtrl.PasswordRecovery)
		profileGroup.POST("/update_password", binders.GetSession, profileCtrl.PasswordUpdate)
	}

	// Авто
	autoGroup := r.Group("/api/auto").Use(binders.GetSession)
	autoCtrl := handlers.NewAutoController()
	{
		autoGroup.GET("/", autoCtrl.GetAll)
		autoGroup.POST("/", autoCtrl.Create)
	}
	autoItemGroup := r.Group("/api/auto_item/:auto_id").Use(binders.GetSession, binders.GetAutoIDFromParam)
	{
		autoItemGroup.PUT("/", autoCtrl.Update)
		autoItemGroup.PUT("/odo", autoCtrl.UpdateODO)
		autoItemGroup.DELETE("/", autoCtrl.Delete)
	}

	// фото авто
	autoImagesGroup := r.Group("/api/images").Use(binders.GetSession)
	autoImagesCtrl := handlers.NewAutoImagesController()
	{
		autoImagesGroup.GET("/:size/:file", autoImagesCtrl.GetImage)
	}

	// Группы
	groupGroups := r.Group("/api/groups").Use(binders.GetSession)
	groupCtrl := handlers.NewGroupsController()
	{
		groupGroups.GET("/", groupCtrl.GetAll)
		groupGroups.POST("/", groupCtrl.Create)
		groupGroups.PUT("/sort", groupCtrl.SortUpdate)
	}
	groupGroup := r.Group("/api/group").Use(binders.GetSession, binders.GetGroupIDFromParam)
	{
		groupGroup.PUT("/:group_id", groupCtrl.Update)
		groupGroup.DELETE("/:group_id", groupCtrl.Delete)
	}

	// Сервисы
	servicesGroup := r.Group("/api/services").Use(binders.GetSession)
	serviceCtrl := handlers.NewServicesController()
	{
		servicesGroup.GET("/", serviceCtrl.Get)
		servicesGroup.POST("/", serviceCtrl.Create)
		servicesGroup.PUT("/:service_id", serviceCtrl.Update)
		servicesGroup.DELETE("/:service_id", serviceCtrl.Delete)
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
