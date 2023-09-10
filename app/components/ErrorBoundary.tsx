import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import ExclamationTriangle from './icons/ExclamationTriangle';

export default function CustomErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      return (
        <div className="flex w-full h-full items-center justify-center flex-col gap-2">
          <ExclamationTriangle className="h-10 w-10 text-grey/70" />
          <p>Seu usuário não tem acesso à esta página.</p>
          <p>Contate o administrador do sistema!</p>
        </div>
      );
    }
  }
}
