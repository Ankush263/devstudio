package config

import "os"

type Config struct {
	Port         string
	DBUrl        string
	JWTSecret    string
	TokenExpiry  string
	AWSAccessKey string
	AWSSecretKey string
	AWSRegion    string
	S3Bucket     string
}

func LoadConfig() *Config {
	cfg := &Config{
		Port:         GetEnv("PORT", "8000"),
		DBUrl:        GetEnv("DB_URL", ""),
		JWTSecret:    GetEnv("JWT_SECRET", ""),
		TokenExpiry:  GetEnv("TOKEN_EXPIRY", "24h"),
		AWSAccessKey: GetEnv("AWS_ACCESS_KEY", ""),
		AWSSecretKey: GetEnv("AWS_SECRET_KEY", ""),
		AWSRegion:    GetEnv("AWS_REGION", "ap-south-1"),
		S3Bucket:     GetEnv("S3_BUCKET", "project-devstudio"),
	}
	return cfg
}

func GetEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
