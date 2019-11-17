package models

type Auto struct {
	AutoID uint64 `json:"auto_id"`
	Name   string `json:"name"`
	Odo    uint32 `json:"odo"`
	Avatar bool   `json:"avatar"`
}

type AutoCreateBody struct {
	Name string `json:"name" binding:"required"`
	Odo  uint32 `json:"odo"`
}

type AutoUpdateBody struct {
	Name string `form:"name" binding:"required"`
	Odo  uint32 `form:"odo"`
}

type AutoUpdateODOBody struct {
	Odo uint32 `json:"odo"`
}
