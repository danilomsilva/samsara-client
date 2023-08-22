import { createCookieSessionStorage, redirect } from '@remix-run/node';

// types
export type User = {
  token: number;
  record: {
    id: number;
    username: string;
  };
};

// consts
const USER_SESSION_KEY = 'userId';
const USER_TOKEN_KEY = 'userToken';
const USER_USERNAME_KEY = 'username';

// functions
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60,
    path: '/',
    sameSite: 'lax',
    secrets: ['some-top-secret-here'],
    secure: true,
  },
});

// will retrieve stored data if exists
export async function getUserSession(request: Request) {
  const session = await getSession(request);

  const userId = session.get(USER_SESSION_KEY);
  const userToken = session.get(USER_TOKEN_KEY);
  const username = session.get(USER_USERNAME_KEY);

  if (session) {
    return { userId, userToken, username };
  } else {
    throw await logout(request);
  }
}

// will retrieve all session whithin cookies
export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

// will add users data to cookie session
export async function createUserSession(
  request: Request,
  user: User,
  redirectTo: string
) {
  const session = await getSession(request);

  session.set(USER_SESSION_KEY, user.record.id);
  session.set(USER_TOKEN_KEY, user.token);
  session.set(USER_USERNAME_KEY, user.record.username);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

// will destroy __session and redirect user to index page
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
