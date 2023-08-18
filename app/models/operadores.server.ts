// if valid will retrieve jwt token from strapi and user data
export async function getOperadores() {
  try {
    const response = await fetch(
      'http://157.245.39.126/api/collections/operadores/records'
    );
    console.log(response);
    return await response.json();
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}
