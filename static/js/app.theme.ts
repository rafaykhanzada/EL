

// Material imports
import { createTheme } from "@mui/material/styles";

// Customising mui theme
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        }
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: "#FAF9F6",
          position: "sticky",
          top: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          userSelect: 'none',
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          left: '12rem', // shift dialog to 12rem (side nav width) left
        }
      }
    }
  },
  palette: {
    primary: {
      main: '#6c5dd3',
    }
  },
});

export default theme;