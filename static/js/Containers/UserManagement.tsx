import { TextField, Button, FormControl, InputLabel, MenuItem, Select, Dialog, DialogContent, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HighlightOff } from "@mui/icons-material";
import { getAllPlans, upgradeUserPlan } from "../services/user.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

const UserManagement = ({ open, onClose }: Props) => {

  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (open) {
      fetchAllPlans();
    }
  }, [open])

  const fetchAllPlans = async () => {
    await getAllPlans().then(
      ((res: any) => {
        setPlans(res);
      })
    ).catch(
      (err) => {
        toast.error("Something went wrong.");
      }
    );
  }

  const handleInputChange = (event: any) => {
    let errors: any = {};
    const { name, value } = event.target;
    switch (name) {
      case 'userEmail': {
        setUserEmail(value);
        if (!value) {
          errors.userEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.userEmail = 'Email is invalid';
        } else {
          delete formErrors.userEmail;
        }
        break;
      }
      case 'userPlan': {
        setUserPlan(value);
        if (!value) {
          errors.userPlan = 'Password is required';
        }
        else if (value.length < 8) {
          errors.userPlan = 'Password must be at least 8 characters';
        } else {
          delete formErrors.userPlan;
        }
        break;
      }
      default:
        break;
    }
    setFormErrors((prevErrors: any) => {
      return { ...prevErrors, ...errors };
    });
  };

  const handleFieldBlur = (event: any) => {
    const { name } = event.target;
    setTouchedFields((prevTouched: any) => {
      return { ...prevTouched, [name]: true };
    });
  };

  const submitUpgradePlanForm = () => {
    if (Object.keys(formErrors).length === 0) {
      upgradeUserPlan({ userEmail: userEmail, newPlanId: userPlan?.id })
        .then((res: any) => {
          toast.success('Plan changed successfully.');
          resetForm();
        })
        .catch((err: any) => {
          toast.error("Something went wrong.");
        });
    }
  };

  const resetForm = () => {
    setFormErrors({});
    setTouchedFields({});
    setUserEmail('');
    setUserPlan(null);
    onClose();
  }

  const covertToLineByLine = (text: any) => {
    return (
      <ul className="mx-5 list-disc"
        dangerouslySetInnerHTML={{ __html: `<li>${text.replace(/\.\s(?!\s*$)/g, '.</li>\n<li>')}</li>` }}
      ></ul>
    )
  }
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <div className="flex flex-row bg-black opacity-90 justify-end p-2 gap-2 items-center border-b-[0.1px] border-b-black border-opacity-50">
        <IconButton
          onClick={() => { resetForm(); onClose(); }}
          size="small"
          className='action'
          sx={{ color: '#6c5dd3' }}>
          <HighlightOff fontSize='small' />
        </IconButton>
      </div>
      <DialogContent>
        <div className="flex flex-col">
          <form className="flex flex-col gap-5 w-full h-full">
            <p className="text-2xl font-bold my-2 text-[#6c5dd3]">Change User Plan</p>
            <TextField
              size="small"
              name="userEmail"
              id="outlined-user-email"
              label="Enter user email address"
              value={userEmail}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={!!(formErrors.userEmail && touchedFields.userEmail)}
              helperText={touchedFields.userEmail ? formErrors.userEmail : ""}
            />
            <FormControl fullWidth size='small'>
              <InputLabel id='select-plan'>Select Plan</InputLabel>
              <Select
                labelId='select-plan'
                id='select-plan'
                variant='outlined'
                disabled={(!!(formErrors.userEmail && touchedFields.userEmail)) || userEmail === ''}
                name='userPlan'
                value={userPlan}
                label='Select Plan'
                onChange={handleInputChange}
              >
                {(plans && plans.length > 0) && plans.map((plan: any) => (
                  <MenuItem value={plan} key={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {userPlan && (
              <div className="text-sm break-words bg-yellow-100 border border-yellow-400 rounded py-1 px-2">
                <p><b>Package Name: </b> {userPlan.name}</p>
                <p><b>Package Detail:</b></p>
                <div>
                  {userPlan.details ? (covertToLineByLine(userPlan.details)) : 'N/A'}
                </div>
              </div>
            )}
          </form>
          <div className="mt-3">
            <Button
              className="w-full"
              disabled={(userEmail.length === 0 || !userPlan) || Object.keys(formErrors).length > 0}
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
              onClick={submitUpgradePlanForm}
            >
              Change plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default UserManagement;