const BASE_URL = 'http://localhost:5000/api/v1/TestCoin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const register = async (name, email, password, role = 'user') => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials, try again or register a new account');
  }

  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};

export const createTransaction = async ({ recipient, amount }) => {
  const response = await fetch(`${BASE_URL}/transactions/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ recipient, amount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create transaction');
  }

  const result = await response.json();
  return result.data;
};

export const mineTransactions = async () => {
  const response = await fetch(`${BASE_URL}/blockchain/mine`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to mine transactions');
  }

  return response.json();
};

export const fetchBlocks = async () => {
  const response = await fetch(`${BASE_URL}/blockchain`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
};
