import { Box, Button, Stack, Typography } from "@mui/material";
import { IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";
import useTranslate from "../languages/useTranslate.jsx";
import AskDialog from "./AskDialog.jsx";
import { useState } from "react";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import eventBus from "../core/EventBus.jsx";
import useAppContext from "../contexts/AppContext.jsx";

export default function DBActions(){

    const [isPersistentDialogOpen, setIsPersistentDialogOpen] = useState(false);
    const [isReloadDialogOpen, setIsReloadDialogOpen] = useState(false);

    const [isCallingPersistent, setIsCallingPersistent] = useState(false);
    const [isCallingReload, setIsCallingReload] = useState(false);

    const showSnackbar = useAppContext(state => state.showSnackbar);

    const { helper } = useWebSocket();
    const { __, _s } = useTranslate();

    function callPersistent(){
        setIsCallingPersistent(true);
        helper.fetch("persistent").then(r => {
            if(r.success) {
                const { finished } = r.data;
                showSnackbar(_s("persistent_finished_in", `${finished}ms`), "success", 6000);
                eventBus.dispatchEvent(new Event("reload_overview"));
            }
            else{
                showSnackbar(_s("persistent_error"), "error");
            }
        }).catch(() => {
            showSnackbar(_s("persistent_error"), "error");
        }).finally(() => {
            setIsCallingPersistent(false);
        });
    }

    function callReload(){
        setIsCallingReload(true);
        helper.fetch("reload").then(r => {
            if(r.success){
                const { finished } = r.data;
                showSnackbar(_s("reload_finished_in", `${finished}ms`), "success", 6000);
                eventBus.dispatchEvent(new Event("reload_overview"));
            }
            else{
                showSnackbar(_s("reload_error"), "error");
            }
        }).catch(() => {
            showSnackbar(_s("reload_error"), "error");
        }).finally(() => {
            setIsCallingReload(false);
        });
    }

    return (<Box sx={{ padding: 2 }}>

        <Stack direction="column" gap={1.2}>

            <Typography variant="h5" textAlign="center" sx={{ padding: "0 16px 4px" }}>{__("database_actions")}</Typography>

            <Button variant="outlined" loading={isCallingPersistent} color="info" startIcon={<IconDeviceFloppy size={18}/>} onClick={() => setIsPersistentDialogOpen(true)}>
                {__("persistent")}
            </Button>

            <Button variant="outlined" loading={isCallingReload} color="warning" startIcon={<IconRefresh size={18}/>} onClick={() => setIsReloadDialogOpen(true)}>
                {__("reload")}
            </Button>

        </Stack>

        <AskDialog open={isPersistentDialogOpen}
                   title={__("persistent_call_confirm")}
                   content={__("persistent_call_confirm_text")}
                   yesButtonText={__("continue")}
                   noButtonText={__("cancel")}
                   onClose={() => setIsPersistentDialogOpen(false)}
                   onAccept={() => callPersistent()}
        />

        <AskDialog open={isReloadDialogOpen}
                   title={__("reload_call_confirm")}
                   content={__("reload_call_confirm_text")}
                   yesButtonText={__("continue")}
                   noButtonText={__("cancel")}
                   onClose={() => setIsReloadDialogOpen(false)}
                   onAccept={() => callReload()}
        />

    </Box>);

}