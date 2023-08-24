import { useIsSubmitting } from "remix-validated-form";

type PropTypes = {
  text: string;
};

export default function Button({ text }: PropTypes) {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Carregando..." : text}
    </button>
  );
}
