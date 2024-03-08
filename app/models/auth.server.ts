import { type User } from '~/session.server';

// if valid will retrieve jwt token and user data
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User> {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/usuario/auth-with-password`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          identity: email,
          password: password,
        }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while verifying credentials!');
  }
}

//request-password-reset
export async function requestPasswordRequest(email: string) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/usuario/request-password-reset`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }
  );
  return response.status;
}

export async function confirmPasswordRequest(
  token: string,
  password: string,
  passwordConfirm: string
) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/usuario/confirm-password-reset`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password, passwordConfirm }),
    }
  );
  return response.status;
}

export async function verifyEmail(email: string) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/usuario/request-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }
  );
  return response.status;
}

export async function confirmVerification(token: string) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/usuario/confirm-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    }
  );
  return response.status;
}
