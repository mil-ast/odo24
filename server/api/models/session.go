package models

import (
	"encoding/binary"
	"errors"
)

type SessionValue struct {
	UserID     uint64 `json:"id"`
	Expiration uint64 `json:"exp"`
}

func (s SessionValue) Bytes() []byte {
	userID := make([]byte, 8)
	binary.LittleEndian.PutUint64(userID, s.UserID)

	exppiration := make([]byte, 8)
	binary.LittleEndian.PutUint64(exppiration, s.Expiration)

	b := append(userID, exppiration...)
	return b
}

func (s *SessionValue) Parse(raw []byte) error {
	if len(raw) < 16 {
		return errors.New("incorrect session size")
	}

	s.UserID = binary.LittleEndian.Uint64(raw[0:8])
	s.Expiration = binary.LittleEndian.Uint64(raw[8:16])

	return nil
}
