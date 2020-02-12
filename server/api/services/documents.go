package services

import (
	"odo24/server/db"
)

// DocumentsService сервис документов
type DocumentsService struct {
	UserID uint64
}

// NewDocumentsService экземпляр сервиса групп
func NewDocumentsService(userID uint64) DocumentsService {
	return DocumentsService{
		UserID: userID,
	}
}

// Create создание документа
func (d DocumentsService) Create(autoID *uint64, dateStart *string, dateEnd string, descript *string, docTypeID uint16) (*uint64, error) {
	conn := db.Conn()

	querySQL := `SELECT doc_id FROM documents.doc_create($1,$2,$3,$4,$5,$6::smallint);`
	row := conn.QueryRow(querySQL, d.UserID, autoID, dateStart, dateEnd, descript, docTypeID)

	var docID uint64
	err := row.Scan(&docID)
	return &docID, err
}
