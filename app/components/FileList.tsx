import { type FileTypes } from '~/models/files.server';
import DocumentIcon from './icons/DocumentIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';

export default function FileList({ files }: { files: FileTypes[] }) {
  const handleDownloadFile = async (file: FileTypes) => {
    const { collectionId, id, file: fileName } = file;

    try {
      const response = await fetch(
        `http://159.223.244.247/api/files/${collectionId}/${id}/${fileName}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        // Trigger file download on the client side
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName[0];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('File download failed');
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="text-sm">
      <label>Anexos</label>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {files.map((item: FileTypes) => {
          return (
            <div key={item?.id} className="flex gap-2 items-center">
              <DocumentIcon className="h-4 w-4" />
              <p
                className="hover:text-blue cursor-pointer"
                onClick={() => handleDownloadFile(item)}
              >
                {item?.name}
              </p>
              <MinusCircleIcon className="h-4 w-4 text-grey hover:text-red cursor-pointer" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
