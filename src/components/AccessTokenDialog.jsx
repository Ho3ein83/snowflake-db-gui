import useTranslate from "../languages/useTranslate.jsx";
import { Box, Button, Dialog, DialogTitle, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useAppContext from "../contexts/AppContext.jsx";
import { getAppSettingInt, LocalDatabase } from "../core/Utils.js";

export default function AccessTokenDialog(){

    // Values
    const [tokenValue, setTokenValue] = useState("");

    // Contexts
    // const accessToken = useAppContext(state => state.accessToken);
    const setAccessToken = useAppContext(state => state.setAccessToken);

    // Translator
    const { __ } = useTranslate();

    function updateAccessToken(){
        setAccessToken(tokenValue);
        LocalDatabase.set(LocalDatabase.KEY_ACCESS_TOKEN, tokenValue);
        LocalDatabase.setExpiration(LocalDatabase.KEY_ACCESS_TOKEN, getAppSettingInt("access_key_expiration", 0));
    }

    return <Dialog open={true}
                   maxWidth="xs"
                   fullWidth>

        <Box sx={{ padding: "20px" }}>

            <DialogTitle>{__("enter_access_token")}</DialogTitle>

            <Typography variant="body2" sx={{ margin: "4px 0 16px" }}>{__("access_token_hint")}</Typography>

            <TextField label={__("access_token")}
                       sx={{ margin: "10px 0 16px" }}
                       type="password"
                       name="password"
                       value={tokenValue}
                       onChange={e => setTokenValue(e.target.value)}
                       fullWidth
            />

            <Button variant="contained" color="primary" size="large" onClick={updateAccessToken} fullWidth>{__("submit")}</Button>

        </Box>

    </Dialog>

}