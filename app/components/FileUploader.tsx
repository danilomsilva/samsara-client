export default function FileUploader({ onChange }) {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const files = event.currentTarget.files;
      onChange(files);
    }
  };

  return <input type="file" name="file" onChange={handleFileChange} />;
}
