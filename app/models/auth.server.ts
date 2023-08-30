// if valid will retrieve jwt token and user data
export async function verifyCredentials(email: string, password: string) {
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
    throw new Error('An error occured when verifying credentials!');
  }
}
