package config

import "os"

type Config struct {
	Port string
	DBUrl string
	JWTSecret string
	TokenExpiry string
}

func LoadConfig() *Config {
	cfg := &Config{
		Port: GetEnv("PORT", "8000"),
		DBUrl: GetEnv("DB_URL", ""),
		JWTSecret: GetEnv("JWT_SECRET", ""),
		TokenExpiry: GetEnv("TOKEN_EXPIRY", "24h"),
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
