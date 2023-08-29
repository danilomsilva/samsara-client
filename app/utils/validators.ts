import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const loginScheme = withZod(
  z.object({
    username: z.string().min(1, { message: 'Campo obrigatório' }),
    password: z.string().min(1, { message: 'Campo obrigatório' }),
  })
);

export const newUsuarioScheme = withZod(
  z.object({
    codigo: z.string(),
    nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
    email: z.string().min(1, { message: 'Campo obrigatório' }),
    password: z.string().min(1, { message: 'Campo obrigatório' }),
    tipo_acesso: z.object(
      {
        name: zfd.text(),
        displayName: zfd.text(),
      },
      {
        required_error: 'Campo obrigatório',
      }
    ),
    obra: z.object(
      {
        name: zfd.text(),
        displayName: zfd.text(),
      },
      {
        required_error: 'Campo obrigatório',
      }
    ),
  })
);
