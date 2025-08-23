import { Alert, Snackbar } from "@mui/material";
import useAppContext from "../contexts/AppContext.jsx";
import { logDevAlt } from "../core/Utils.js";

export default function GlobalSnackbar(){

    logDevAlt("[Render] GlobalSnackbar");

    // Snackbar
    const snackbar = useAppContext(state => state.snackbar);
    const setSnackbar = useAppContext(state => state.setSnackbar);

    return (<Snackbar open={snackbar.isOpen}
                      autoHideDuration={snackbar.autoHideDuration}
                      anchorOrigin={snackbar.position}
                      onClose={() => setSnackbar({ isOpen: false })}
                      className="GlobalSnackbar"
                      sx={{
                          marginBottom: {
                              xs: snackbar.mobileBottomOffset + "px",
                              md: snackbar.tabletBottomOffset + "px",
                              lg: snackbar.desktopBottomOffset + "px"
                          }
                      }}
    >
        <Alert severity={snackbar.severity}
               variant={snackbar.variant}
               sx={{width: '100%'}}
               icon={snackbar.showIcon}
        >
            {snackbar.text}
        </Alert>
    </Snackbar>);
}