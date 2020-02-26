package models

// Document список всех документов
type Document struct {
	DocID     uint64  `json:"doc_id"`
	AutoID    *uint64 `json:"auto_id,omitempty"`
	DateStart *string `json:"date_start,omitempty"`
	DateEnd   string  `json:"date_end"`
	Descript  *string `json:"descript,omitempty"`
	IsClosed  bool    `json:"is_closed,omitempty"`
	DocTypeID uint16  `json:"doc_type_id"`
}

// DocumentCreateBody тело запроса для создания документа
type DocumentCreateBody struct {
	AutoID    *uint64 `json:"auto_id"`
	DateStart *string `json:"date_start"`
	DateEnd   string  `json:"date_end" binding:"required"`
	Descript  *string `json:"descript"`
	DocTypeID uint16  `json:"doc_type_id" binding:"required"`
}
