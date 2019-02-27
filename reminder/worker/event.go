package worker

import "fmt"

type Event struct {
	ID        uint64
	EventType string
	DateStart string
	DateEnd   string
	AvtoID    uint64
	Email     string
	CarName   string
}

type EventList struct {
	List []Event
}

func (list EventList) Send() error {
	if len(list.List) == 0 {
		return nil
	}

	for _, event := range list.List {
		go event.sendEvent()
	}

	return nil
}

func (event Event) sendEvent() error {
	fmt.Println(event)
	return nil
}
