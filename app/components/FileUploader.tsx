import { useRef } from 'react';
import DocumentIcon from './icons/DocumentIcon';
import SpinnerIcon from './icons/SpinnerIcon';

//TODO: improve on this types!!
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
      <div className="w-[250px] bg-white border-dashed border-2 border-grey rounded-lg py-4">
        {isUploadingFile ? (
          <div className="flex justify-center flex-col gap-1 items-center">
            <SpinnerIcon />
            <p>Carregando...</p>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2"
          >
            <DocumentIcon className="w-10 h-10" />
            <span className="text-xs">
              Clique ou arraste <br /> algum arquivo aqui.
            </span>
            <input
              id="file-upload"
              type="file"
              name="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
          </label>
        )}
      </div>
    </div>
  );
}
