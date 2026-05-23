package services

import (
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client *s3.S3
	bucket string
	region string
}

func NewS3Service(accessKey, secretKey, region, bucket string) (*S3Service, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(region),
		Credentials: credentials.NewStaticCredentials(accessKey, secretKey, ""),
	})
	if err != nil {
		return nil, err
	}

	return &S3Service{
		client: s3.New(sess),
		bucket: bucket,
		region: region,
	}, nil
}

// Upload sends r to S3 under prefix/uuid.ext and returns the object's public URL.
// fileType should be "video" or "oplog"; ext should include the dot (e.g. ".webm", ".json").
func (s *S3Service) Upload(r io.ReadSeeker, fileType, ext, contentType string) (string, error) {
	key := fmt.Sprintf("%ss/%s%s", fileType, uuid.New().String(), ext)

	_, err := s.client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        r,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
	return url, nil
}
