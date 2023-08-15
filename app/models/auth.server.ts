// if valid will retrieve jwt token from strapi and user data
export async function verifyCredentials(username: string, password: string) {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/auth/local`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        identifier: username,
        password: password,
      }),
    });
    return await response.json();
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}
