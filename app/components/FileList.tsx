import { type FileTypes } from '~/models/files.server';
import DocumentIcon from './icons/DocumentIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';
import { useFetcher } from '@remix-run/react';
import SpinnerIcon from './icons/SpinnerIcon';
import { useState } from 'react';

export default function FileList({
  files,
  path,
}: {
  files: FileTypes[];
  path: string;
}) {
  const [removingFile, setRemovingFile] = useState<string | null>(null);
  const removeFileFetcher = useFetcher();
  const isRemovingFile =
    removeFileFetcher.state === 'submitting' ||
    removeFileFetcher.state === 'loading';

  const handleDownloadFile = async (file: FileTypes) => {
    const { collectionId, id, file: fileName } = file;

    try {
      const response = await fetch(
        `http://159.223.244.247/api/files/${collectionId}/${id}/${fileName}`
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

  const handleRemoveFile = (file: FileTypes) => {
    setRemovingFile(file.id);
    removeFileFetcher.submit(
      {
        id: file.id,
      },
      {
        method: 'post',
        action: `../../remove-file-${path}`,
      }
    );
  };

  return (
    <div className="text-sm">
      {files.length > 0 && <label>Anexos</label>}
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
              {isRemovingFile && removingFile === item.id ? (
                <SpinnerIcon className="h-3 w-3" />
              ) : (
                <MinusCircleIcon
                  className="h-4 w-4 text-grey hover:text-red cursor-pointer"
                  onClick={() => handleRemoveFile(item)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
