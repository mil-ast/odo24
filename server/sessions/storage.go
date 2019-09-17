package sessions

import (
	"errors"
	"odo24/server/api/models"
	"sync"
	"time"
)

type Storage struct {
	mu       sync.RWMutex
	sessions map[string]*models.Profile
}

func NewStorage() Storage {
	s := Storage{}
	s.sessions = make(map[string]*models.Profile)

	go s.clear()
	return s
}

func (s *Storage) Set(session string, profile *models.Profile) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	profile.LastTime = time.Now()
	s.sessions[session] = profile

	return nil
}

func (s *Storage) Get(session string) (*models.Profile, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	profile, ok := s.sessions[session]
	if !ok {
		return nil, errors.New("sess: not found")
	}

	if profile.LastTime.Add(SessionTimeout).Before(time.Now()) {
		delete(s.sessions, session)
		return nil, errors.New("sess: not found")
	}

	profile.LastTime = time.Now()

	return profile, nil
}

func (s *Storage) Delete(session string) {
	s.mu.Lock()
	delete(s.sessions, session)
	s.mu.Unlock()
}

func (s *Storage) GetByUserID(userID uint64) (string, *models.Profile) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for sesID, profile := range s.sessions {
		if profile.UserID == userID {
			return sesID, profile
		}
	}

	return "", nil
}

func (s *Storage) clear() {
	ticker := time.NewTicker(time.Minute)

	for now := range ticker.C {
		s.mu.Lock()

		for key, profile := range s.sessions {
			if profile.LastTime.Add(SessionTimeout).Before(now) {
				delete(s.sessions, key)
			}
		}

		s.mu.Unlock()
	}
}
