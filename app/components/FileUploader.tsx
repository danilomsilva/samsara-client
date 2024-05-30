import { useRef } from 'react';
import DocumentIcon from './icons/DocumentIcon';
import SpinnerIcon from './icons/SpinnerIcon';

export default function FileUploader({
  onChange,
  isUploadingFile,
}: {
  onChange: any;
  isUploadingFile: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const files = event.currentTarget.files;
      onChange(files);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[250px] bg-white border-dashed border-2 border-grey/50 rounded-lg">
        {isUploadingFile ? (
          <div className="flex justify-center flex-col gap-1 items-center py-4">
            <SpinnerIcon />
            <p className="text-sm">Carregando...</p>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 cursor-pointer py-4 hover:text-blue"
          >
            <DocumentIcon className="w-10 h-10 text-grey/50" />
            <span className="text-xs">
              Clique aqui para <br /> adicionar arquivos.
            </span>
            <input
              id="file-upload"
              type="file"
              name="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              //only accpets images, pdf files and excel sheets
              accept=".pdf, image/*, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </label>
        )}
      </div>
    </div>
  );
}
