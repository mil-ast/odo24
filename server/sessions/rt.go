package sessions

import (
	"odo24/server/utils"
	"strings"
	"time"
)

type RT struct {
	Token      string
	Expiration time.Time
}

func newRefreshToken() RT {
	expRTTime := time.Now().Add(RTTimeout)
	asciiTimeEncode := timeToASCII(expRTTime.UTC())
	randStr := utils.GenerateRandomString(18)

	return RT{
		Token:      asciiTimeEncode + randStr,
		Expiration: expRTTime,
	}
}

// timeToASCII вернет 6 знаков с таблицы знаков ASCII временем: год, месяц, день, час, минута
//						 Секунд нет чтобы уместить в 32 бита
func timeToASCII(t time.Time) string {
	year := t.Year()
	month := int(t.Month())
	day := t.Day()
	hour := t.Hour()
	minute := t.Minute()

	date := uint32(year<<20) | uint32(month<<16) | uint32(day<<11) | uint32(hour<<6) | uint32(minute)

	var (
		sBuilder strings.Builder
		b6Bit    byte
		i        int8 = 25
	)
	for n := 0; n < 6; n++ {
		b6Bit = byte(date>>i) & 0x3F
		sBuilder.WriteByte(byte8bitToASCII(b6Bit))

		i -= 6
		if i < 0 {
			i = 0
		}
	}

	return sBuilder.String()
}

func fromASCIIToTime(str string) time.Time {
	var (
		timeBitArray uint32
		b8Bit        byte
		i            int8 = 25
	)
	for n := 0; n < 6; n++ {
		b8Bit = fromASCIIToByte(byte(str[n]))
		timeBitArray |= uint32(b8Bit) << i

		i -= 6
		if i < 0 {
			i = 0
		}
	}

	year := int((timeBitArray >> 20) & 0x0fff)
	month := int((timeBitArray >> 16) & 0x0f)
	day := int((timeBitArray >> 11) & 0x1f)
	hour := int((timeBitArray >> 6) & 0x1f)
	minute := int((timeBitArray) & 0x3f)

	t := time.Date(year, time.Month(month), day, hour, minute, 0, 0, time.Now().Location())

	return t
}

func byte8bitToASCII(char byte) byte {
	if char < 32 {
		char += 64
	}
	return char
}

func fromASCIIToByte(char byte) byte {
	if char > 63 {
		char -= 64
	}
	return byte(char)
}
