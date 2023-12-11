import { useRef } from 'react';
import DocumentIcon from './icons/DocumentIcon';

//TODO: improve on this types!!
export default function FileUploader({ onChange }: { onChange: any }) {
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
    <div className="w-full flex justify-center">
      <div className="w-[250px] bg-white border-dashed border-2 border-grey rounded-lg py-4">
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
      </div>
    </div>
  );
}
