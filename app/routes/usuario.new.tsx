import { useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';

// form validation scheme
export const validator = withZod(
  z.object({
    nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
    email: z.string().min(1, { message: 'Campo obrigatório' }),
    senha: z.string().min(1, { message: 'Campo obrigatório' }),
    tipo_acesso: z.string().min(1, { message: 'Campo obrigatório' }),
    obra: z.string().min(1, { message: 'Campo obrigatório' }),
  })
);

export default function NewUsuario() {
  const [searchParams] = useSearchParams();
  const userCodigo = searchParams.get('user');

  return (
    <Modal
      title="Adicionar Usuário"
      validator={validator}
      footerActions={
        <Button
          className="bg-blue"
          icon={<PlusCircleIcon />}
          text="Adicionar"
        />
      }
    >
      <Row>
        <Input
          type="text"
          name="codigo"
          label="Código"
          className="w-40"
          defaultValue={userCodigo || 'N/A'}
          disabled
        />
        <Input type="text" name="nome_completo" label="Nome completo" />
      </Row>
      <Row>
        <Input type="text" name="email" label="Email" />
        <Input type="password" name="senha" label="Senha" className="w-40" />
      </Row>
      <Row>
        <Input type="text" name="tipo_acesso" label="Tipo de acesso" />
        <Input type="text" name="obra" label="Alocado à obra" />
      </Row>
    </Modal>
  );
}
