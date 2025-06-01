package transaction

import (
	"blockchain-dev1/types"
	"blockchain-dev1/utils"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/asn1"
	"encoding/json"
	"fmt"
	"math/big"
)

// Serialize creates a byte slice of transaction data for hashing/signing
func Serialize(tx *types.Transaction) []byte {
	return []byte(tx.Sender + tx.Recipient + fmt.Sprintf("%.8f", tx.Amount))
}

func GenerateTransactionID(tx types.Transaction) string {
	txBytes, _ := json.Marshal(tx)
	hash := sha256.Sum256(txBytes)
	return fmt.Sprintf("%x", hash[:])
}

// ecdsaSignature is used for ASN.1 encoding/decoding
type ecdsaSignature struct {
	R, S *big.Int
}

func SignTransaction(priv *ecdsa.PrivateKey, tx *types.Transaction) error {
	// SET SENDER from pubkey
	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(&priv.PublicKey)
	tx.Sender = utils.GetAddress(pubKeyBytes)

	hash := sha256.Sum256(Serialize(tx))

	r, s, err := ecdsa.Sign(rand.Reader, priv, hash[:])
	if err != nil {
		return err
	}

	sig := ecdsaSignature{r, s}
	tx.Signature, err = asn1.Marshal(sig)
	if err != nil {
		return err
	}

	tx.PubKey = pubKeyBytes
	return nil
}

func VerifyTransaction(tx *types.Transaction) bool {
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

	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(pubKey)
	calculatedAddress := utils.GetAddress(pubKeyBytes)

	// fmt.Printf("Calculated hash: %x\n", hash[:])
	// fmt.Printf("Parsed sig: r=%x, s=%x\n", sig.R, sig.S)
	fmt.Printf("Sender:         %s\n", tx.Sender)
	fmt.Printf("Expected sender: %s\n", calculatedAddress)

	if tx.Sender != calculatedAddress {
		fmt.Println("Sender address does not match public key")
		return false
	}

	hash := sha256.Sum256(SerializeForSigning(tx))

	var sig ecdsaSignature
	_, err = asn1.Unmarshal(tx.Signature, &sig)
	if err != nil {
		fmt.Println("Invalid signature format:", err)
		return false
	}

	return ecdsa.Verify(pubKey, hash[:], sig.R, sig.S)
}

// SerializeForSigning serializes transaction without Signature and PubKey
func SerializeForSigning(tx *types.Transaction) []byte {
	tmp := *tx // shallow copy
	tmp.Signature = nil
	tmp.PubKey = nil
	return Serialize(&tmp)
}
