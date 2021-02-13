package main

import (
	"fmt"
	"log"
	"net"
)

func main() {
	localAddr, err := net.ResolveUDPAddr("udp", ":9000")
	if err != nil {
		panic(err)
	}

	conn, err := net.ListenUDP("udp", localAddr)
	if err != nil {
		panic(err)
	}

	handler(conn)
}

func handler(conn *net.UDPConn) {
	buf := make([]byte, 128)
	for {
		n, addr, err := conn.ReadFromUDP(buf)
		if err != nil {
			log.Println("Error: ", err)
			continue
		}
		fmt.Println("Received ", string(buf[0:n]), " from ", addr)

		conn.WriteToUDP([]byte("pong"), addr)
	}
}
