const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmailPattern(email: string) {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email address');
  }
}

export { validateEmailPattern };
