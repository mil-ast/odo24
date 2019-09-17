package utils

import (
	"math/rand"
)

const charts string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateRandom случайное число в диапазоне
func GenerateRandomNumber(min, max uint32) uint32 {
	var value = rand.Uint32()
	value %= (max - min)
	value += min
	return value
}

// GenerateRandomString строка
func GenerateRandomString(size int) string {
	output := make([]byte, size)
	randomness := make([]byte, size)
	_, err := rand.Read(randomness)
	if err != nil {
		return ""
	}
	l := len(charts)
	for pos := range output {
		random := uint8(randomness[pos])
		randomPos := random % uint8(l)
		output[pos] = charts[randomPos]
	}
	return string(output)
}
