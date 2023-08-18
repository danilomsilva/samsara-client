// if valid will retrieve jwt token from strapi and user data
export async function getOperadores() {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operadores/records`
    );

    return await response.json();
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}
