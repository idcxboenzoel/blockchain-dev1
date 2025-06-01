package types

// Transaction represents a basic transaction
type Transaction struct {
	Sender    string  // Address of sender
	Recipient string  // Address of recipient
	Amount    float64 // Amount to transfer
	Fee       float64 // Transaction fee
	PubKey    []byte  // Sender's public key in DER format
	Signature []byte  // ASN.1-encoded ECDSA signature
	ID        string
}
