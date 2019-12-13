package models

type Service struct {
	ServiceID    uint64  `json:"service_id"`
	Odo          *uint32 `json:"odo"`
	NextDistance *uint32 `json:"next_distance"`
	Dt           string  `json:"dt"`
	Description  *string `json:"description"`
	Price        *uint32 `json:"price"`
}
