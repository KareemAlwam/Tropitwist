const requiredFields = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  email: 'Enter your email address.',
  phone: 'Enter your phone number.',
  address: 'Enter your delivery address.',
  city: 'Enter your city.',
  area: 'Enter your area.',
};

function normalizePhone(value) {
  const compact = String(value || '').replace(/[\s()-]/g, '');
  if (compact.startsWith('+20')) return `0${compact.slice(3)}`;
  if (compact.startsWith('0020')) return `0${compact.slice(4)}`;
  return compact;
}

export function isEgyptianMobileNumber(value) {
  return /^01[0125]\d{8}$/.test(normalizePhone(value));
}

export function validateCheckout(values) {
  const errors = {};
  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!String(values[field] || '').trim()) errors[field] = message;
  });
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) errors.email = 'Enter a valid email address.';
  if (!errors.phone && !isEgyptianMobileNumber(values.phone)) errors.phone = 'Enter a valid Egyptian mobile number.';
  return errors;
}

export function withoutPaymentDetails(values) {
  const { payment: _payment, ...customer } = values;
  return customer;
}
