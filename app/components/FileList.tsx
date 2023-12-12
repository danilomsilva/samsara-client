import { type FileTypes } from '~/models/files.server';
import DocumentIcon from './icons/DocumentIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';
import { useFetcher } from '@remix-run/react';

export default function FileList({ files }: { files: FileTypes[] }) {
  const downloadFileFetcher = useFetcher();

  const handleDownloadFile = (file) => {
    const { collectionId, id, file: fileName } = file;
    downloadFileFetcher.submit(
      {
        collectionId,
        id,
        fileName: fileName[0],
      },
      {
        method: 'post',
        action: '../../download-file',
      }
    );
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
