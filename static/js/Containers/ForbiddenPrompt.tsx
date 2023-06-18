import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import React, { } from "react";
import { HighlightOff, ReportProblem } from "@mui/icons-material";
import { logout } from "../services/auth.service";

type Props = {
  open: boolean;
  onClose: () => void;
  showLogout: boolean;
};

const ForbiddenPrompt = ({ open, onClose, showLogout = true }: Props) => {

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="flex flex-row bg-black opacity-90 justify-end p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50">
        <IconButton
          onClick={() => { logout() }}
          size="small"
          className='action'
          sx={{ color: '#6c5dd3' }}>
          <HighlightOff fontSize='small' />
        </IconButton>
      </div>
      <DialogContent>
        <div className="flex flex-col justify-center items-center gap-4">
          <ReportProblem sx={{
            fontSize: '5rem',
            color: '#ff9966'
          }} />
          <p className="text-center px-4">
            You do not have permission to access this resource. You might be accessing EastLaw outside of your organization’s network.
          </p>
          {
            showLogout &&(
            <Button
            className="w-full"
            variant="contained"
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
            onClick={() => { logout() }}
            >
            Logout
          </Button>)
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ForbiddenPrompt;