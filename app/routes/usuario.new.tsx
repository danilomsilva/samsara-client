import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';

export default function NewUsuario() {
  return (
    <Modal
      title="Adicionar Usuário"
      footerActions={
        <LinkButton to="./new" className="bg-blue" icon={<PlusCircleIcon />}>
          Adicionar
        </LinkButton>
      }
    >
      some content
    </Modal>
  );
}
