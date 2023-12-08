import { useFetcher } from 'react-router-dom';

export default function FileUploader() {
  //   const [files, setFiles] = useState(null);
  const fetcher = useFetcher();

  const handleFileChange = (e) => {
    const file = new FormData();
    file.append('documents', e.target.files[0]);
    file.append('title', e.target.files[0].name);
    file.append('_action', 'upload_file');

    fetcher.submit(file, { method: 'post', encType: 'multipart/form-data' });
  };
  return <input type="file" name="file" onChange={handleFileChange} />;
}
