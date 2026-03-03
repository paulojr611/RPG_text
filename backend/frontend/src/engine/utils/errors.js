export function getApiErrorMessage(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const apiError = error?.response?.data?.error;
  const validationErrors = error?.response?.data?.errors;

  if (typeof apiError === "string" && apiError.length > 0) {
    return apiError;
  }

  if (typeof apiMessage === "string" && apiMessage.length > 0) {
    return apiMessage;
  }

  if (validationErrors && typeof validationErrors === "object") {
    const firstKey = Object.keys(validationErrors)[0];
    if (firstKey && Array.isArray(validationErrors[firstKey]) && validationErrors[firstKey][0]) {
      return validationErrors[firstKey][0];
    }
  }

  return fallbackMessage;
}

