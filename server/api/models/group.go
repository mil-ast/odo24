package models

type Group struct {
	GroupID uint64 `json:"group_id"`
	Name    string `json:"group_name"`
	Sort    uint32 `json:"sort"`
}
