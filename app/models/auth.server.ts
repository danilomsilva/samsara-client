// if valid will retrieve jwt token from strapi and user data
export async function verifyCredentials(username: string, password: string) {
  try {
    const response = await fetch(
      `http://159.223.244.247/collections/usuarios/auth-with-password`,
      
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          identity: username,
          password: password,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}
