const requiredFields = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  email: 'Enter your email address.',
  phone: 'Enter your phone number.',
  address: 'Enter your delivery address.',
  city: 'Enter your city.',
  area: 'Enter your area.',
};

export function validateCheckout(values, paymentMethod) {
  const errors = {};
  Object.entries(requiredFields).forEach(([field, message]) => {
    if (!String(values[field] || '').trim()) errors[field] = message;
  });
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) errors.email = 'Enter a valid email address.';
  if (!errors.phone && !/^[+\d\s()-]{8,}$/.test(String(values.phone).trim())) errors.phone = 'Enter a valid phone number.';
  if (paymentMethod === 'card') {
    if (!/^\d{16}$/.test(String(values.cardNumber || '').replace(/\s/g, ''))) errors.cardNumber = 'Enter a 16-digit card number.';
    if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(String(values.expiry || '').trim())) errors.expiry = 'Use MM / YY format.';
    if (!/^\d{3,4}$/.test(String(values.cvv || '').trim())) errors.cvv = 'Enter a valid CVV.';
  }
  return errors;
}

export function withoutPaymentDetails(values) {
  const { cardNumber: _cardNumber, expiry: _expiry, cvv: _cvv, payment: _payment, ...customer } = values;
  return customer;
}
