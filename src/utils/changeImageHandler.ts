export const changeImageHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  setImage: (value: React.SetStateAction<File | null>) => void
) => {
  if (e.target.files![0]) {
    setImage(e.target.files![0]);
    e.target.value = "";
  }
};
