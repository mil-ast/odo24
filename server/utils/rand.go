package utils

import (
	"math/rand"
	"time"
)

const charts string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()=-.,"

// GenerateRandomNumber случайное число в диапазоне
func GenerateRandomNumber(min, max uint32) uint32 {
	src := rand.NewSource(time.Now().UnixNano())
	rnd := rand.New(src)

	var value = rnd.Uint32()
	value %= (max - min)
	value += min
	return value
}

// GenerateRandomString строка
func GenerateRandomString(size int) string {
	src := rand.NewSource(time.Now().UnixNano())
	rnd := rand.New(src)

	output := make([]byte, size)
	randomness := make([]byte, size)
	_, err := rnd.Read(randomness)
	if err != nil {
		return ""
	}
	l := uint8(len(charts))
	for pos := range output {
		random := uint8(randomness[pos])
		randomPos := random % l
		output[pos] = charts[randomPos]
	}
	return string(output)
}
