import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { [key: string]: any };
  };
  status: StatusCode;
}

export function handleError(error: ErrorResponse, c: Context, err?: any) {
  const {
    error: { code, message, details = {} },
  } = error;
  if (err) {
    details.error_message = err.message;
    details.stack_trace = err.stack;
  }
  return c.json({ error: { code, message, details } }, error.status);
}

export const emailInUse: ErrorResponse = {
  error: {
    code: "EMAIL_IN_USE",
    message: "The email you entered is already in use, please try another one.",
  },
  status: 409,
};

export const registrationError: ErrorResponse = {
  error: {
    code: "REGISTRATION_ERROR",
    message: "Error during registration.",
  },
  status: 500,
};

export const invalidPassword: ErrorResponse = {
  error: {
    code: "INVALID_PASSWORD",
    message:
      "The password you entered does not meet the required security standards. Please try a different password.",
  },
  status: 400,
};

export const invalidEmail: ErrorResponse = {
  error: {
    code: "INVALID_EMAIL",
    message: "The email you entered is not in a valid format.",
  },
  status: 400,
};

export const emailNotVerified: ErrorResponse = {
  error: {
    code: "EMAIL_NOT_VERIFIED",
    message: "The email provided has not been verified.",
  },
  status: 403,
};

export const userEmailAlreadyVerified: ErrorResponse = {
  error: {
    code: "EMAIL_ALREADY_VERIFIED",
    message: "This email is already verified.",
  },
  status: 403,
};

export const invalidCredentials: ErrorResponse = {
  error: {
    code: "INVALID_CREDENTIALS",
    message: "The email or password you entered is incorrect.",
  },
  status: 401,
};

export const serverError: ErrorResponse = {
  error: {
    code: "SERVER_ERROR",
    message: "An internal server error occurred. Please try again later.",
  },
  status: 500,
};

export const userNotFound: ErrorResponse = {
  error: {
    code: "USER_NOT_FOUND",
    message:
      "The provided email address or token could not be found in our system.",
  },
  status: 404,
};

export const expiredOrInvalidLink: ErrorResponse = {
  error: {
    code: "EXPIRED_OR_INVALID_LINK",
    message: "Expired or invalid link.",
  },
  status: 404,
};

export const expiredOrInvalidCode: ErrorResponse = {
  error: {
    code: "EXPIRED_OR_INVALID_CODE",
    message: "Expired or invalid code.",
  },
  status: 404,
};

export const loginError: ErrorResponse = {
  error: {
    code: "LOGIN_ERROR",
    message: "Error during login.",
  },
  status: 500,
};

export const emailVerificationError: ErrorResponse = {
  error: {
    code: "EMAIL_VERIFICATION_ERROR",
    message: "Error during email verification.",
  },
  status: 500,
};

export const emailVerificationDisabled: ErrorResponse = {
  error: {
    code: "EMAIL_VERIFICATION_DISABLED",
    message: "Email verification is not enabled for this application.",
  },
  status: 400,
};

export const applicationNotFound: ErrorResponse = {
  error: {
    code: "APPLICATION_NOT_FOUND",
    message:
      "The application could not be found with the provided X-Authc1-Id.",
  },
  status: 404,
};

export const messageRejectedError: ErrorResponse = {
  error: {
    code: "MESSAGE_REJECTED",
    message: "The email message was rejected by Amazon SES.",
    details: {
      reason:
        "The email address or domain of the recipient is in a bounce list or suppression list",
    },
  },
  status: 400,
};

export const invalidParameterValueError: ErrorResponse = {
  error: {
    code: "INVALID_PARAMETER_VALUE",
    message: "An invalid value was provided for one of the request parameters.",
    details: {
      parameter_name: "ToAddresses",
    },
  },
  status: 400,
};

export const credentialsError: ErrorResponse = {
  error: {
    code: "CREDENTIALS_ERROR",
    message: "The provided AWS credentials are invalid.",
  },
  status: 401,
};

export const mailFromDomainNotVerifiedError: ErrorResponse = {
  error: {
    code: "MAIL_FROM_DOMAIN_NOT_VERIFIED",
    message: "The Mail-From domain is not verified.",
  },
  status: 400,
};

export const accountSuspendedError: ErrorResponse = {
  error: {
    code: "ACCOUNT_SUSPENDED",
    message: "The AWS account has been suspended.",
  },
  status: 403,
};

export const configurationSetDoesNotExistError: ErrorResponse = {
  error: {
    code: "CONFIGURATION_SET_DOES_NOT_EXIST",
    message: "The specified configuration set does not exist.",
  },
  status: 400,
};

export const createApplicationError: ErrorResponse = {
  error: {
    code: "CREATE_APPLICATION_ERROR",
    message: "Error occurred while creating the application.",
  },
  status: 500,
};

export const invalidInputError: ErrorResponse = {
  error: {
    code: "INVALID_INPUT",
    message: "The request payload does not match the expected schema.",
  },
  status: 400,
};

export const nameOrSettingsRequired: ErrorResponse = {
  error: {
    code: "ERROR_NAME_OR_SETTINGS_NOT_PRESENT",
    message: "Either name or settings must be present in the request body",
  },
  status: 400,
};

export const updateApplicationError: ErrorResponse = {
  error: {
    code: "ERROR_UPDATING_APPLICATION",
    message: "Error updating the application",
  },
  status: 500,
};

export const getApplicationError: ErrorResponse = {
  error: {
    code: "GET_APPLICATION_BY_ID_ERROR",
    message: "Error while fetching application by ID",
  },
  status: 500,
};

export const applicationNotFoundError: ErrorResponse = {
  error: {
    code: "APPLICATION_NOT_FOUND",
    message: "The requested application id could not be found.",
  },
  status: 404,
};

export const refreshTokenNotValidError: ErrorResponse = {
  error: {
    code: "REFRESH_TOKEN_NOT_VALID",
    message: "The provided refresh token is not valid.",
  },
  status: 401,
};

export const getUserError: ErrorResponse = {
  error: {
    code: "GET_USER_ERROR",
    message: "An error occurred while retrieving the user information.",
  },
  status: 500,
};

export const updateUserError: ErrorResponse = {
  error: {
    code: "UPDATE_USER_ERROR",
    message: "An error occurred while updating the user information.",
  },
  status: 500,
};

export const unauthorizedError: ErrorResponse = {
  error: {
    code: "UNAUTHORIZED",
    message: "Invalid credentials provided.",
  },
  status: 401,
};

export const expiredTokenError: ErrorResponse = {
  error: {
    code: "TOKEN_EXPIRED",
    message:
      "Expired access token provided. Please log in again to get a new access token.",
  },
  status: 401,
};

export const unauthorizedDataRequestError: ErrorResponse = {
  error: {
    code: "UNAUTHORIZED_DATA_REQUEST",
    message: "You are not authorized to access this Application.",
  },
  status: 401,
};

export const clientIdNotProvidedError: ErrorResponse = {
  error: {
    code: "CLIENT_ID_NOT_PROVIDED",
    message: "Provider's client ID is not provided.",
  },
  status: 500,
};

export const redirectUrlNotProvidedError: ErrorResponse = {
  error: {
    code: "REDIRECT_URL_NOT_PROVIDED",
    message: "Provider Option Redirect Url is not provided.",
  },
  status: 500,
};

export const redirectFailedError: ErrorResponse = {
  error: {
    code: "REDIRECT_FAILED",
    message: "Failed to redirect for authentication.",
  },
  status: 500,
};

export const providerNotEnabledError: ErrorResponse = {
  error: {
    code: "PROVIDER_NOT_ENABLED",
    message: "The provider is not enabled for this application.",
  },
  status: 500,
};
