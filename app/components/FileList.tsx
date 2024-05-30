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
    <div className="text-sm !w-[250px]">
      <label>Anexos</label>
      <div className="flex flex-wrap gap-x-4 gap-y-1 max-w-[280px] overflow-hidden">
        {files.length ? (
          files.map((item: FileTypes) => {
            const splitName = item?.name?.split('.');
            return (
              <div key={item?.id} className="flex gap-2 items-center truncate">
                <div>
                  <DocumentIcon className="h-4 w-4" />
                </div>
                <div className="truncate overflow-hidden flex">
                  <a
                    href={`http://159.223.244.247/api/files/${item.collectionId}/${item.id}/${item.file}`}
                    target="_blank"
                    rel="noreferrer"
                    download={true}
                    className="truncate hover:text-blue"
                  >
                    {splitName[0]}
                  </a>
                  <div>{`.${splitName[1]}`}</div>
                </div>
                <div>
                  {isRemovingFile && removingFile === item.id ? (
                    <SpinnerIcon className="h-3 w-3" />
                  ) : (
                    <MinusCircleIcon
                      className="h-4 w-4 text-grey hover:text-red cursor-pointer"
                      onClick={() => handleRemoveFile(item)}
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>Nenhum arquivo adicionado!</p>
        )}
      </div>
    </div>
  );
}
