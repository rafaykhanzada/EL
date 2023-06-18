import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Cancel, CloudUpload, HighlightOff } from "@mui/icons-material";
import { registerOrganization } from "../services/organization.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

const OrganizationManagement = ({ open, onClose }: Props) => {
  const [file, setFile] = useState<any>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();

  const [dragging, setDragging] = useState(false);

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xlsx")) {
      setFile(droppedFile);
      setSelectedFileName(droppedFile.name);
    } else {
      toast.error("Please drop an XLSX file");
    }
  };

  const addOrganizations = () => {
    registerOrganization(file).then((res: any) => {
      if (res.error && res.error === 'userAlreadyExists') {
        toast.info('Organization users already exist');
      } else if (res.error && res.error === 'noUsersCreated') {
        toast.error('Failed to create users for organization');
      } else if (res.success) {
        toast.success('Organization added successfully')
      }
      resetForm();
    }).catch(err => {
      console.log(err);
      toast.error('Failed to add organization')
    })
  };

  const selectFile = (event: any) => {
    console.log(event.target.files)
    setFile(event.target.files[0])
    setSelectedFileName(event.target.files[0].name);
  };

  const resetForm = () => {
    setFile(null);
    setSelectedFileName('');
    onClose();
  }

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="flex flex-row bg-black opacity-90 justify-end p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50">
        <IconButton
          onClick={() => { resetForm(); onClose(); }}
          size="small"
          className="action"
          sx={{ color: "#6c5dd3" }}
        >
          <HighlightOff fontSize="small" />
        </IconButton>
      </div>
      <DialogContent>
        <div className="flex flex-col">
          <p className="text-2xl font-bold my-2 text-[#6c5dd3]">
            Add Organization
          </p>
          <div
            className={`max-w-xl mt-3 ${dragging ? "border-blue-600" : ""}`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <label
              htmlFor="file_upload"
              className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
            >
              <span className="flex items-center space-x-2">
                {file && selectedFileName !== '' ? (
                  <div className="flex flex-row justify-center items-center">
                    <span className="max-w-[15rem] truncate">{selectedFileName}</span>
                    <IconButton onClick={(event) => {
                      event.preventDefault();
                      setFile(null);
                      setSelectedFileName('');
                    }}>
                      <Cancel sx={{
                        color: 'tomato',
                        fontSize: '1.2rem'
                      }} />
                    </IconButton>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center items-center gap-2">
                    <CloudUpload color="primary" />
                    <span className="font-medium text-gray-600">
                      Drop files to Attach, or{' '}
                      <span className="text-blue-600 underline">browse</span>
                    </span>
                  </div>
                )}
              </span>
              <input
                id="file_upload"
                type="file"
                accept=".xlsx"
                name="file_upload"
                className="hidden"
                onChange={selectFile}
              />
            </label>
          </div>
          <div className="mt-3">
            <Button
              className="w-full"
              variant="contained"
              disabled={!file}
              sx={{
                zIndex: "10",
                background: "#6c5dd3",
                ":hover": {
                  bgcolor: "#645DD3",
                  color: "white",
                },
                textTransform: 'none',
                marginTop: '1rem'
              }}
              onClick={addOrganizations}
            >
              Add Organization
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default OrganizationManagement;