import {
  type Session,
  createCookieSessionStorage,
  redirect,
} from '@remix-run/node';
import { type Usuario } from './models/usuario.server';

// types
export type User = {
  token: number;
  record: Usuario;
};

// consts
const USER_SESSION_CODIGO = 'codigo';
const USER_SESSION_TOKEN = 'userToken';
const USER_SESSION_EMAIL = 'email';
const USER_SESSION_ID = 'id';
const USER_SESSION_NOME_COMPLETO = 'nome_completo';
const USER_SESSION_TIPO_ACESSO = 'tipo_acesso';
const USER_SESSION_VERIFIED = 'verified';

// functions
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 86400, // 1 day
    path: '/',
    sameSite: 'lax',
    secrets: [`${process.env.SESSION_SECRET}`],
    secure: process.env.NODE_ENV === 'production',
    // secure: true,
  },
});

// will retrieve stored data if exists
export async function getUserSession(request: Request) {
  const session = await getSession(request);

  const userId = session.get(USER_SESSION_CODIGO);
  const userToken = session.get(USER_SESSION_TOKEN);
  const email = session.get(USER_SESSION_EMAIL);
  const id = session.get(USER_SESSION_ID);
  const nomeCompleto = session.get(USER_SESSION_NOME_COMPLETO);
  const tipoAcesso = session.get(USER_SESSION_TIPO_ACESSO);
  const verified = session.get(USER_SESSION_VERIFIED);

  if (session) {
    return {
      userId,
      userToken,
      email,
      id,
      nomeCompleto,
      tipoAcesso,
      verified,
    };
  } else {
    throw await logout(request);
  }
}

// will retrieve all session whithin cookies
export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function commitSession(session: Session) {
  return await sessionStorage.commitSession(session);
}

// will add users data to cookie session
export async function createUserSession(
  request: Request,
  user: User,
  redirectTo: string
) {
  const session = await getSession(request);

  session.set(USER_SESSION_CODIGO, user.record.id);
  session.set(USER_SESSION_TOKEN, user.token);
  session.set(USER_SESSION_EMAIL, user.record.email);
  session.set(USER_SESSION_ID, user.record.id);
  session.set(USER_SESSION_NOME_COMPLETO, user.record.nome_completo);
  session.set(USER_SESSION_TIPO_ACESSO, user.record.tipo_acesso);
  session.set(USER_SESSION_VERIFIED, user.record.verified);

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

export async function setToastMessage(
  session: Session,
  title: string = '',
  message: string,
  variant: string
) {
  return session.flash('toastMessage', { title, message, variant });
}
