package models

type Auto struct {
	AvtoID uint64 `json:"avto_id"`
	Name   string `json:"name"`
	Odo    uint32 `json:"odo"`
	Avatar bool   `json:"avatar"`
}

type BindingAutoCreate struct {
	Name string `json:"name"`
	Odo  uint32 `json:"odo"`
}
