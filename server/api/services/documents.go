package services

import (
	"odo24/server/api/models"
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

// Get получение документов
func (d DocumentsService) Get() ([]models.Document, error) {
	conn := db.Conn()

	querySQL := `SELECT doc_id,auto_id,date_start,date_end,description,is_closed,doc_type_id FROM documents.get_all($1);`
	rows, err := conn.Query(querySQL, d.UserID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var result []models.Document
	for rows.Next() {
		doc := models.Document{}
		e := rows.Scan(&doc.DocID, &doc.AutoID, &doc.DateStart, &doc.DateEnd, &doc.Descript, &doc.IsClosed, &doc.DocTypeID)
		if e != nil {
			return nil, err
		}

		result = append(result, doc)
	}

	return result, nil
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
