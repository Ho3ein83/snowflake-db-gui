import "../assets/css/Sidebar.css";
import useAppContext from "../contexts/AppContext.jsx";
import { Box, CardActionArea, Divider, List, Stack, Typography } from "@mui/material";
import useThemeMode from "../hooks/useThemeMode.js";
import { IconAdjustmentsAlt, IconDatabase, IconHome, IconLogout } from "@tabler/icons-react";
import useTranslate from "../languages/useTranslate.jsx";
import { useEffect, useState } from "react";
import { getHashPage, LocalDatabase } from "../core/Utils.js";
import AskDialog from "./AskDialog.jsx";
import snowflakeSvg from "../../public/snowflake.svg";
import snowflakeBrightSvg from "../../public/snowflake-bright.svg";

export default function Sidebar(){

    // Theme mode
    const [actualTheme] = useThemeMode();

    // States
    const [selectedPage, setSelectedPage] = useState("");
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    // Sidebar
    const sidebarCollapsed = useAppContext(state => state.sidebarCollapsed);
    const setSidebarCollapsed = useAppContext(state => state.setSidebarCollapsed);
    const currentAccess = useAppContext(state => state.currentAccess);

    // Contexts
    const appInfo = useAppContext(state => state.appInfo);

    const { __ } = useTranslate();

    useEffect(() => {
        function resetPage(){
            setSelectedPage(getHashPage());
        }
        resetPage();
        window.addEventListener("popstate", resetPage);
        return () => {
            window.removeEventListener("popstate", resetPage);
        }
    }, []);

    useEffect(() => {
        document.body.classList[sidebarCollapsed ? "add" : "remove"]("sidebar-collapsed");
    }, [sidebarCollapsed]);

    /**
     * @type {SnowflakeSidebarMenuItem[]}
     */
    const sidebarItems = [
        {
            path: "",
            label: "home",
            icon: IconHome
        }
    ];

    if(currentAccess.hasAccess("cp_database")){
        sidebarItems.push({
            path: "database",
            label: "database",
            icon: IconDatabase,
        });
    }

    if(currentAccess.hasAccess("change_config")){
        sidebarItems.push({
            path: "config",
            label: "configuration",
            icon: IconAdjustmentsAlt,
        });
    }

    sidebarItems.push({
        label: "",
        isDivider: true
    });

    sidebarItems.push({
        label: "logout",
        color: "red",
        icon: IconLogout,
        callback: () => {
            setLogoutDialogOpen(true);
        }
    });

    function doLogout(){
        LocalDatabase.remove(LocalDatabase.KEY_ACCESS_TOKEN);
        location.reload();
    }

    return (<>

        <div className={`SidebarSpacer${sidebarCollapsed ? "" : " expand"}`}></div>

        <div className={`SidebarOverlay ${sidebarCollapsed ? "invisible" : "visible"}`} onClick={() => setSidebarCollapsed(true)}></div>

        <Box className={`Sidebar${sidebarCollapsed ? "" : " expand"}`}>

            <Stack direction="column" alignItems="center" justifyContent="center" gap={1} sx={{ height: "86px" }}>

                <img src={actualTheme === "light" ? snowflakeSvg : snowflakeBrightSvg} alt="Snowflake" style={{ width: 70 }} />

            </Stack>

            <Stack direction="column" className="SidebarNavContainer">

                <List className="SidebarNavMenu" component="nav">

                    {sidebarItems.map((item, idx) => {
                        const ItemIcon = item.icon;
                        if(item?.isDivider)
                            return <Divider key={idx}/>;
                        const isActive = item.path === selectedPage;
                        return (
                            <CardActionArea key={idx} href={typeof item.path === "string" ? ("#/" + item.path) : null}
                                            className={`SidebarNavItem${isActive ? " active" : ""} --${item?.color || "default"}`}
                                            onClick={item.callback ?? null}
                            >
                                <Stack direction="row" gap={1.5}>
                                    {ItemIcon ? <ItemIcon size={20}/> : null}
                                    <Typography variant="body1">{__(item.label)}</Typography>
                                </Stack>
                            </CardActionArea>
                        );
                    })}

                </List>

                <div style={{ flex: 1 }}></div>

                <Typography variant="body2" textAlign="center" className="waiting font-title">{appInfo.name}</Typography>
                <Typography variant="body2" textAlign="center" className="waiting font-title">v{appInfo.version}</Typography>

            </Stack>

        </Box>

        <AskDialog open={logoutDialogOpen}
                   title={__("logout_confirm")}
                   content={__("logout_confirm_hint")}
                   onClose={() => setLogoutDialogOpen(false)}
                   yesButtonText={__("logout")}
                   noButtonText={__("cancel")}
                   yesButtonColor="error"
                   noButtonColor="primary"
                   closeOnAccept={false}
                   onAccept={doLogout}
        />

    </>);
}