import Csrf from 'csrf';
import { parseCookies, setCookie } from 'nookies';
import type { GetServerSidePropsContext } from 'next';

const COOKIE_KEY = 'csrfSecret';

/**
 * @name createCsrfCookie
 * @description Creates a CSRF secret cookie and returns the CSRF token to be
 * sent to the client-side. The client-side will return this token in the
 * HTTP request header.
 * @param ctx
 */
async function createCsrfCookie(ctx: GetServerSidePropsContext) {
  const csrf = new Csrf();
  const existingSecret = parseCookies(ctx)[COOKIE_KEY];

  if (existingSecret) {
    setCsrfSecretCookie(ctx, existingSecret);

    return csrf.create(existingSecret);
  }

  const secret = await csrf.secret();

  setCsrfSecretCookie(ctx, secret);

  return csrf.create(secret);
}

export default createCsrfCookie;

function setCsrfSecretCookie(ctx: GetServerSidePropsContext, secret: string) {
  // set a CSRF token secret, so we can validate it on POST requests
  setCookie(ctx, COOKIE_KEY, secret, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === `production`,
    sameSite: 'strict',
  });
}
