package constants

// User role constants
const (
	// Default role used when user skips onboarding or no role is provided
	DefaultUserRole = "custom"
	
	// Default learning goal for custom role
	DefaultLearningGoal = "General learning"
	
	// Valid user roles
	RoleJAMB         = "jamb"
	RoleUndergrad    = "undergraduate"
	RoleUniversity   = "university"
	RoleMasters      = "masters"
	RoleLecturer     = "lecturer"
	RoleCustom       = "custom"
)

// User role validation slice for easy validation
var ValidUserRoles = []string{
	RoleJAMB,
	RoleUndergrad,
	RoleUniversity,
	RoleMasters,
	RoleLecturer,
	RoleCustom,
}
