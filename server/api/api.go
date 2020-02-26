package api

import (
	"odo24/server/api/binders"
	"odo24/server/api/handlers"

	"github.com/gin-gonic/gin"
)

// InitHandlers API приложения
func InitHandlers(production bool) *gin.Engine {
	mode := gin.ReleaseMode
	if !production {
		mode = gin.DebugMode
	}

	gin.SetMode(mode)

	r := gin.Default()
	r.GET("/api/ping", handlers.Ping)

	// Профиль
	profileGroup := r.Group("/api/profile")
	profileCtrl := handlers.NewProfileController()
	{
		profileGroup.GET("", binders.GetSession, profileCtrl.ProfileGet)
		profileGroup.POST("/login", handlers.CheckUserAgent, profileCtrl.Login)
		profileGroup.GET("/oauth", binders.GetOauthParamsFromQuery, profileCtrl.OAuth)
		profileGroup.GET("/logout", profileCtrl.Logout)
		profileGroup.PUT("/refresh_token", binders.GetRefreshTokenFromBody, profileCtrl.RefreshToken)
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

	// Документы
	docGroup := r.Group("/api/documents").Use(binders.GetSession)
	docCtrl := handlers.NewDocumentsController()
	{
		docGroup.GET("/", docCtrl.GetAll)
		docGroup.POST("/", docCtrl.Create)
	}

	return r
}
