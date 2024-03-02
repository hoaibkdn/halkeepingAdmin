export const validatePhoneNumber = (phoneNumber: string) => {
  const phoneNumberPattern = /^(?:\+?84|0)(?:\d{9}|\d{3}\s\d{3}\s\d{3}|\d{2}\s\d{3}\s\d{4})$/;
  return phoneNumberPattern.test(phoneNumber);
};

export const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const isNumber = (value: number) => {
  return typeof value === 'number';
};
