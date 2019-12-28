package sessions

/*import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

var secretKey [32]byte

// SetSecretKey ключ шифрования с конфига
func SetSecretKey(key string) {
	copy(secretKey[:32], []byte(key)[:32])
}

func encrypt(message []byte) ([]byte, error) {
	block, err := aes.NewCipher(secretKey[0:32])
	if err != nil {
		return nil, err
	}
	b := base64.StdEncoding.EncodeToString(message)
	ciphertext := make([]byte, aes.BlockSize+len(b))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}
	cfb := cipher.NewCFBEncrypter(block, iv)
	cfb.XORKeyStream(ciphertext[aes.BlockSize:], []byte(b))
	return ciphertext, nil
}

func decrypt(message []byte) ([]byte, error) {
	block, err := aes.NewCipher(secretKey[0:32])
	if err != nil {
		return nil, err
	}
	if len(message) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}
	iv := message[:aes.BlockSize]
	message = message[aes.BlockSize:]
	cfb := cipher.NewCFBDecrypter(block, iv)
	cfb.XORKeyStream(message, message)
	data, err := base64.StdEncoding.DecodeString(string(message))
	if err != nil {
		return nil, err
	}
	return data, nil
}
*/
