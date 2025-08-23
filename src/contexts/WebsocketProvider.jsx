import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Backdrop, Button, Stack, Typography } from "@mui/material";
import GradientCircularProgress from "../components/GradientCircularProgress.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import SocketHelper from "./SocketHelper.js";
import eventBus from "../core/EventBus.jsx";
import useAppContext from "./AppContext.jsx";
import AccessToken from "../core/objects/AccessToken.js";
import AccessTokenDialog from "../components/AccessTokenDialog.jsx";
import { LocalDatabase } from "../core/Utils.js";

const WebsocketContext = createContext(null);

const SOCKET_STATES = {
    INIT: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTING: 3,
    DISCONNECTED: 4,
    ERROR: 5
}

export function WebSocketProvider({ host, port, secure, children }){

    // States
    const [firstTime, setFirstTime] = useState(true);
    const [socketState, setSocketState] = useState(SOCKET_STATES.INIT);

    // Contexts
    const accessToken = useAppContext(state => state.accessToken);
    const appInfo = useAppContext(state => state.appInfo);
    const setAppInfo = useAppContext(state => state.setAppInfo);
    const setCurrentAccess = useAppContext(state => state.setCurrentAccess);

    // Socket reference
    const websocket = useRef(null);

    // Socket helper
    const [socketHelper, setSocketHelper] = useState(null);

    // Translator
    const { __ } = useTranslate();

    function reconnect(){

        if(accessToken === null)
            return;

        setSocketState(SOCKET_STATES.CONNECTING);

        websocket.current = new WebSocket(`ws${secure ? "s" : ""}://${host}:${port}?token=${accessToken || ""}`);

        let errorHappened = false;

        websocket.current.onopen = () => {
            setSocketState(SOCKET_STATES.CONNECTED);
            setFirstTime(false);
        }

        websocket.current.onclose = () => {

            setAppInfo({
                ...appInfo,
                loaded: false
            });

            // Remove all the access
            setCurrentAccess(new AccessToken());

            if(!errorHappened)
                setSocketState(SOCKET_STATES.DISCONNECTED);
        }

        websocket.current.onerror = event => {
            setSocketState(SOCKET_STATES.ERROR);
            errorHappened = true;
        }

        setSocketHelper(new SocketHelper(websocket.current));

    }

    useEffect(() => {

        eventBus.addEventListener("socket_action_received", function(event){
            const { action, resp } = event.detail;
            if(action === "accepted"){
                const { info, access } = resp.data;
                if(access){
                    const accessObject = new AccessToken(access);
                    setCurrentAccess(accessObject);
                    if(accessObject.hasAccess("control_panel")){
                        setAppInfo({
                            ...info,
                            loaded: true
                        });
                    }
                }
            }
        });

        eventBus.addEventListener("socket_message_received", function(event){
            console.log("Message:", event);
        });

    }, []);

    useEffect(() => reconnect(), []);
    useEffect(() => reconnect(), [accessToken]);

    if(accessToken === null)
        return <AccessTokenDialog />;

    let statusText = "";
    switch (socketState){
        case SOCKET_STATES.INIT:
        case SOCKET_STATES.CONNECTING:
            statusText = __("connecting") + "...";
            break;
        case SOCKET_STATES.DISCONNECTED:
            statusText = __("disconnected");
            break;
        case SOCKET_STATES.DISCONNECTING:
            statusText = __("disconnecting") + "...";
            break;
        case SOCKET_STATES.ERROR:
            statusText = __("error_occurred");
            break;
    }

    let isFetching = false;
    if(appInfo.loaded === null && socketState !== SOCKET_STATES.ERROR && socketState !== SOCKET_STATES.DISCONNECTED) {
        statusText = __("fetching_data") + "...";
        isFetching = true;
    }

    function doLogout(){
        LocalDatabase.remove(LocalDatabase.KEY_ACCESS_TOKEN);
        location.reload();
    }

    return (
        <WebsocketContext.Provider value={{
            socket: websocket.current,
            helper: socketHelper
        }}>
            <Backdrop
                sx={(theme) => ({ background: "var(--sfd-fg-color)", zIndex: theme.zIndex.drawer + 1 })}
                open={socketState !== SOCKET_STATES.CONNECTED || !appInfo.loaded}
            >
                <Stack direction="column" alignItems="center" justifyContent="center" gap={2}>
                    {([SOCKET_STATES.INIT, SOCKET_STATES.DISCONNECTING, SOCKET_STATES.CONNECTING].includes(socketState) || isFetching) ? <GradientCircularProgress size={60}/> : null}
                    <Typography>{statusText}</Typography>
                    {[SOCKET_STATES.DISCONNECTED, SOCKET_STATES.ERROR].includes(socketState) ? (<Stack direction="row" gap={1}>
                        <Button variant="contained" onClick={reconnect}>{__("reconnect")}</Button>
                        <Button variant="outlined" color="error" onClick={doLogout}>{__("logout")}</Button>
                    </Stack>) : null}
                </Stack>
            </Backdrop>

            {(firstTime || !appInfo.loaded) ? null : children}
        </WebsocketContext.Provider>
    );

}

/**
 * @returns {null|{socket: WebSocket, helper: SocketHelper}}
 */
export function useWebSocket() {
    return useContext(WebsocketContext);
}