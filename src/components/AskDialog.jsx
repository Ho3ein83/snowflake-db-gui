import { Box, Button, Dialog, DialogTitle, Stack, Typography } from "@mui/material";
import useTranslate from "../languages/useTranslate.jsx";

export default function AskDialog({
                                      open: isOpen,
                                      title,
                                      content = null,
                                      yesButtonText = null,
                                      noButtonText = null,
                                      yesButtonColor = null,
                                      noButtonColor = null,
                                      onAccept = null,
                                      onDismiss = null,
                                      onClose = null,
                                      closeOnAccept = true,
                                      closeOnDismiss = true,
                                      children = null,
                                      acceptOnEnter = false
                                  }) {

    const { __ } = useTranslate();

    function handleClose(){
        if(typeof onClose === "function")
            onClose();
    }

    function handleAccept(){
        if(typeof onAccept === "function")
            onAccept();
        if(closeOnAccept)
            handleClose();
    }

    function handleDismiss(){
        if(typeof onDismiss === "function")
            onDismiss();
        if(closeOnDismiss)
            handleClose();
    }

    return (
        <Dialog open={isOpen}
                maxWidth="xs"
                onClose={handleClose}
                disableRestoreFocus
                fullWidth>

            <Box sx={{ padding: "20px" }}>

                <DialogTitle>{title}</DialogTitle>

                {content ? <Typography sx={{ marginTop: 0 }}>{content}</Typography> : null}

                {children}

                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ marginTop: 2 }}>
                    <Button variant="contained" autoFocus color={yesButtonColor ? yesButtonColor : "primary"} onClick={handleAccept}>{yesButtonText ? yesButtonText : __("yes")}</Button>
                    {noButtonText ? <Button variant="text" color={noButtonColor ? noButtonColor : "primary"} onClick={handleDismiss}>{typeof noButtonText === "string" ? noButtonText : __("no")}</Button> : null}
                </Stack>

            </Box>

        </Dialog>
    );

}