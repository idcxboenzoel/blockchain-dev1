package main

import (
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/asn1"
	"fmt"
	"math/big"
)

// Transaction represents a basic transaction
type Transaction struct {
	Sender    string  // Address of sender
	Recipient string  // Address of recipient
	Amount    float64 // Amount to transfer
	Fee       float64 // Transaction fee
	PubKey    []byte  // Sender's public key in DER format
	Signature []byte  // ASN.1-encoded ECDSA signature
}

// Serialize creates a byte slice of transaction data for hashing/signing
func (tx *Transaction) Serialize() []byte {
	return []byte(tx.Sender + tx.Recipient + fmt.Sprintf("%.8f", tx.Amount))
}

// ecdsaSignature is used for ASN.1 encoding/decoding
type ecdsaSignature struct {
	R, S *big.Int
}

// SignTransaction signs the transaction with the sender's private key
func SignTransaction(priv *ecdsa.PrivateKey, tx *Transaction) error {
	hash := sha256.Sum256(tx.Serialize())

	r, s, err := ecdsa.Sign(rand.Reader, priv, hash[:])
	if err != nil {
		return err
	}

	sig := ecdsaSignature{r, s}
	tx.Signature, err = asn1.Marshal(sig)
	if err != nil {
		return err
	}

	tx.PubKey, err = x509.MarshalPKIXPublicKey(&priv.PublicKey)
	if err != nil {
		return err
	}

	return nil
}

// VerifyTransaction verifies the transaction signature and ownership
func VerifyTransaction(tx *Transaction) bool {
	// Parse public key from bytes
	pubInterface, err := x509.ParsePKIXPublicKey(tx.PubKey)
	if err != nil {
		fmt.Println("Invalid public key:", err)
		return false
	}
	pubKey, ok := pubInterface.(*ecdsa.PublicKey)
	if !ok {
		fmt.Println("Invalid public key type")
		return false
	}

	// Check ownership (prevent spoofing)
	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(pubKey)
	calculatedAddress := GetAddress(pubKeyBytes)
	if tx.Sender != calculatedAddress {
		fmt.Println("Sender address does not match public key")
		return false
	}

	// Hash transaction data
	hash := sha256.Sum256(tx.Serialize())

	// Decode ASN.1 signature
	var sig ecdsaSignature
	_, err = asn1.Unmarshal(tx.Signature, &sig)
	if err != nil {
		fmt.Println("Invalid signature format:", err)
		return false
	}

	// Verify the signature
	return ecdsa.Verify(pubKey, hash[:], sig.R, sig.S)
}
