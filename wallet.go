package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"database/sql"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

const walletFileDefault = ""

func CreateWallet(filename string) error {
	if _, err := os.Stat(filename); err == nil {
		return fmt.Errorf("wallet file %s already exists", filename)
	}

	priv, err := GenerateKeyPair()
	if err != nil {
		return err
	}
	return SavePrivateKey(priv, filename)
}

func GenerateKeyPair() (*ecdsa.PrivateKey, error) {
	return ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
}

func SavePrivateKey(priv *ecdsa.PrivateKey, filename string) error {
	b, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return err
	}
	privPem := pem.EncodeToMemory(&pem.Block{
		Type:  "EC PRIVATE KEY",
		Bytes: b,
	})
	return ioutil.WriteFile(filename, privPem, 0600)
}

func LoadPrivateKey(filename string) (*ecdsa.PrivateKey, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil || block.Type != "EC PRIVATE KEY" {
		return nil, fmt.Errorf("invalid PEM file")
	}
	return x509.ParseECPrivateKey(block.Bytes)
}

func openWalletDB() (*sql.DB, error) {
	return sql.Open("sqlite3", "wallets.db")
}

func initWalletDB() error {
	db, err := openWalletDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT UNIQUE,
        privkey BLOB
    )`)
	return err
}

func SaveWalletToDB(address string, privPem []byte) error {
	db, err := openWalletDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec(`INSERT OR REPLACE INTO wallets(address, privkey) VALUES (?, ?)`, address, privPem)
	return err
}

func LoadWalletFromDB(address string) (*ecdsa.PrivateKey, error) {
	db, err := openWalletDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	row := db.QueryRow(`SELECT privkey FROM wallets WHERE address = ?`, address)
	var privPem []byte
	if err := row.Scan(&privPem); err != nil {
		return nil, err
	}
	block, _ := pem.Decode(privPem)
	return x509.ParseECPrivateKey(block.Bytes)
}

func CreateWalletInDB() (string, error) {
	priv, err := GenerateKeyPair()
	if err != nil {
		return "", err
	}
	b, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return "", err
	}
	privPem := pem.EncodeToMemory(&pem.Block{
		Type:  "EC PRIVATE KEY",
		Bytes: b,
	})
	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(&priv.PublicKey)
	address := GetAddress(pubKeyBytes)
	err = SaveWalletToDB(address, privPem)
	return address, err
}
