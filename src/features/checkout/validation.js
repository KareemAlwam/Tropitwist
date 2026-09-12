const requiredFields = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  email: 'Enter your email address.',
  phone: 'Enter your phone number.',
  address: 'Enter your delivery address.',
  city: 'Enter your city.',
  area: 'Enter your area.',
};

export function validateCheckout(values) {
  const errors = {};
  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!String(values[field] || '').trim()) errors[field] = message;
  });
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) errors.email = 'Enter a valid email address.';
  if (!errors.phone && !/^[+\d\s()-]{8,}$/.test(String(values.phone).trim())) errors.phone = 'Enter a valid phone number.';
  return errors;
}

export function withoutPaymentDetails(values) {
  const { payment: _payment, ...customer } = values;
  return customer;
}
