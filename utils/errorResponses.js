const missingFieldsError = (detail = "Required fields are missing") => {
    return {
        errors: [
            {
                status: "400",
                title: "Missing Fields",
                detail: detail,
                source: {
                    pointer: "/data/attributes"
                }
            }
        ]
    };
};

const forbiddenError = (detail = "You do not have permission to access") =>{
    return{
        errors: [
            {
                status: "403",
                title: "Forbidden",
                detail: detail,
                source: {
                    pointer: "/data/attributes"
                }
            }
        ]
    }
}


const notFoundError = (detail = "Not found") => {
    return{
        errors: [
            {
                status: "404",
                title: "Not Found",
                detail: detail,
                source: {
                    pointer: "/data/attributes"
                }
            }
        ]
    }
}



const validationError = (zodIssues) => {
    const errors = zodIssues.map(issue => ({
        status: "422",
        title: "Unprocessable Content",
        detail: issue.message,
        source: {
            pointer: `/data/attributes/${issue.path[0]}`
        }
    }));

    return { errors };
};


const conflictError = (detail, field = null) => {
    const error = {
        status: "409",
        title: "Resource Conflict",
        detail: detail
    };

    if (field) {
        error.source = {
            pointer: `/data/attributes/${field}`
        };
    } else {
        error.source = {
            pointer: "/data/attributes"
        };
    }

    return { errors: [error] };
};


const databaseError = (error) => {
    console.error("Database error:", error);

    if (error.code === 'P2002') {
        return {
            errors: [
                {
                    status: "409",
                    title: "Database Conflict",
                    detail: "A user with this email or username already exists",
                    source: {
                        pointer: "/data/attributes"
                    }
                }
            ]
        };
    }


    return {
        errors: [
            {
                status: "500",
                title: "Internal Server Error",
                detail: "An unexpected error occurred"
            }
        ]
    };
};


const internalServerError = (detail = "An unexpected error occurred") => {
    return {
        errors: [
            {
                status: "500",
                title: "Internal Server Error",
                detail: detail
            }
        ]
    };
};


const unauthorizedError = () => {
    return {
        errors: [
            {
                status: "401",
                title: "Unauthorized",
                detail: "Authentication required"
            }
        ]
    };
};

module.exports = {
    missingFieldsError,
    validationError,
    conflictError,
    databaseError,
    internalServerError,
    unauthorizedError,
    forbiddenError,
    notFoundError
};