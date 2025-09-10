package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// ValidateStruct validates a struct using the validator package
func ValidateStruct(s interface{}) error {
	err := validate.Struct(s)
	if err != nil {
		// Create a more user-friendly error message
		var errors []string
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, fmt.Sprintf("Field '%s' failed validation: %s", err.Field(), err.Tag()))
		}
		return fmt.Errorf(strings.Join(errors, ", "))
	}
	return nil
}

// ValidateEmail validates an email address
func ValidateEmail(email string) bool {
	return validate.Var(email, "required,email") == nil
}

// ValidateRequired validates that a field is not empty
func ValidateRequired(field interface{}) bool {
	return validate.Var(field, "required") == nil
}

// ValidateMin validates minimum length
func ValidateMin(field string, min int) bool {
	return validate.Var(field, fmt.Sprintf("min=%d", min)) == nil
}

// ValidateMax validates maximum length
func ValidateMax(field string, max int) bool {
	return validate.Var(field, fmt.Sprintf("max=%d", max)) == nil
}

// ValidateOneOf validates that a field is one of the specified values
func ValidateOneOf(field string, values []string) bool {
	return validate.Var(field, fmt.Sprintf("oneof=%s", strings.Join(values, " "))) == nil
}