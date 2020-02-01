package sessions

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"hash"
	"log"
	"odo24/server/api/models"
	"strings"
	"time"
)

const (
	// HS512 алгоритм шифрования
	HS512 = "HS512"
	// HS256 алгоритм шифрования
	HS256 = "HS256"
)

const (
	errUnrecognizedAlgorithm = "unrecognized signing algorithm"
	errFailedToParse         = "failed to parse"
)

// Token распаршеный токен
type Token struct {
	Algorithm string
	Signature []byte
	body      []byte

	Header map[string]interface{}
	Claims models.SessionValue
}

// Verify проверка токена
func (t *Token) Verify(secret []byte) bool {
	var h hash.Hash

	switch t.Algorithm {
	case HS256:
		h = hmac.New(sha256.New, secret)
	case HS512:
		h = hmac.New(sha512.New, secret)
	default:
		return false
	}

	_, err := h.Write(t.body)
	if err != nil {
		log.Println(err)
		return false
	}
	expectedMAC := h.Sum(nil)
	return hmac.Equal(t.Signature, expectedMAC)
}

// NewToken создание нового токена
func NewToken(algorithm string, secret []byte, userID uint64) (*TokenInfo, error) {
	header := make(map[string]interface{}, 2)
	header["typ"] = "JWT"
	header["alg"] = algorithm

	headerEncoded, err := json.Marshal(header)
	if err != nil {
		return nil, err
	}

	b64Header := base64.RawURLEncoding.EncodeToString(headerEncoded)

	jwtExp := time.Now().Add(CookieTimeout)
	claims := models.SessionValue{
		UserID:     userID,
		Expiration: uint64(jwtExp.UTC().Unix()),
	}

	claimsEncoded, err := json.Marshal(claims)
	if err != nil {
		return nil, err
	}

	base64Claims := base64.RawURLEncoding.EncodeToString(claimsEncoded)
	jwtStr := fmt.Sprintf("%s.%s", b64Header, base64Claims)

	var h hash.Hash
	switch algorithm {
	case HS256:
		h = hmac.New(sha256.New, secret)
	case HS512:
		h = hmac.New(sha512.New, secret)
	default:
		return nil, errors.New(errUnrecognizedAlgorithm)
	}

	_, err = h.Write([]byte(jwtStr))
	if err != nil {
		return nil, err
	}

	macSig := h.Sum(nil)
	b64Sig := base64.RawURLEncoding.EncodeToString(macSig)

	jwt := fmt.Sprintf("%s.%s", jwtStr, string(b64Sig))

	rt := newRefreshToken(jwt)
	result := TokenInfo{
		Jwt:           jwt,
		RT:            rt.Token,
		RtExpiration:  rt.Expiration,
		JwtExpiration: jwtExp,
	}
	return &result, nil
}

// ParseToken парсинг строки токена
func ParseToken(tokenStr string) (*Token, error) {
	rawSegs := strings.Split(tokenStr, ".")
	if len(rawSegs) != 3 {
		return nil, errors.New(errFailedToParse)
	}

	token := Token{}

	header, err := base64.RawURLEncoding.DecodeString(rawSegs[0])
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(header, &token.Header)
	if err != nil {
		return nil, err
	}

	if token.Header["typ"] != "JWT" {
		return nil, errors.New(errFailedToParse)
	}

	alg, ok := token.Header["alg"]
	if !ok {
		return nil, errors.New(errUnrecognizedAlgorithm)
	}
	algValue := alg.(string)
	switch algValue {
	case HS256, HS512:
		token.Algorithm = algValue
	default:
		return nil, errors.New(errUnrecognizedAlgorithm)
	}

	claims, err := base64.RawURLEncoding.DecodeString(rawSegs[1])
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(claims, &token.Claims)
	if err != nil {
		return nil, err
	}

	sig, err := base64.RawURLEncoding.DecodeString(rawSegs[2])
	if err != nil {
		return nil, err
	}

	token.Signature = sig
	token.body = []byte(fmt.Sprintf("%s.%s", rawSegs[0], rawSegs[1]))

	return &token, nil
}
