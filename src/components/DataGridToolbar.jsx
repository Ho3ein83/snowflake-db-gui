import { useEffect, useState } from "react";
import { Badge, Button, Divider, Fade, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import { ColumnsPanelTrigger, FilterPanelTrigger, QuickFilter, QuickFilterClear, QuickFilterControl, QuickFilterTrigger, Toolbar, ToolbarButton, } from '@mui/x-data-grid';
import { ColumnsIcon, FilterIcon, ReloadIcon, SearchIcon, XIcon } from "../Icons/Icons.jsx";
import { styled } from '@mui/material/styles';
import useMailFilterStore from "../Contexts/MailFilterProvider.jsx";

const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    width: 'min-content',
    height: 'min-content',
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
    "& fieldset": {
        borderRadius: "12px"
    }
}));

export default function DataGridToolbar(props){
    const [anySelected, setAnySelected] = useState(false);
    // const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(props.isDisabled ?? false);
    // const exportMenuTriggerRef = useRef(null);

    useEffect(() => {
        if(typeof props.selectedItems === "object" && typeof props.selectedItems.size !== "undefined"){
            setAnySelected(props.selectedItems.size > 0);
        }
    }, [props.selectedItems]);

    useEffect(() => setIsDisabled(props.isDisabled), [props]);

    const currentCategory = useMailFilterStore(state => state.currentCategory);

    return (
        <Toolbar>

            <Fade in={anySelected}>
                <Stack direction="row" gap="8px" sx={{ flex: 1 }} flexWrap="wrap">
                    {!currentCategory.startsWith("deleted") ? <Button variant="text" color="error" onClick={() => {
                        if (typeof props.trashRequest === "function")
                            props.trashRequest();
                    }} disableElevation>حذف</Button> : ""}
                </Stack>
            </Fade>

            <Tooltip title="ستون ها">
                <ColumnsPanelTrigger className={isDisabled ? "waiting" : ""} render={<ToolbarButton />}>
                    <ColumnsIcon />
                </ColumnsPanelTrigger>
            </Tooltip>

            <Tooltip title="فیلتر ها">
                <FilterPanelTrigger className={isDisabled ? "waiting" : ""} render={(props, state) => (
                    <ToolbarButton {...props} color="default">
                        <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                            <FilterIcon fontSize="small"/>
                        </Badge>
                    </ToolbarButton>
                )}
                />
            </Tooltip>

            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

            {typeof props.onReload === "function" ? <Tooltip title="تازه سازی">
                <ToolbarButton onClick={() => props.onReload()}>
                    <ReloadIcon/>
                </ToolbarButton>
            </Tooltip> : null}

            {/*<Tooltip title="خروجی" className="no-mobile">
             <ToolbarButton
             className={isDisabled ? "waiting" : ""}
             ref={exportMenuTriggerRef}
             id="export-menu-trigger"
             aria-controls="export-menu"
             aria-haspopup="true"
             aria-expanded={exportMenuOpen ? 'true' : undefined}
             onClick={() => setExportMenuOpen(true)}>
             <DownloadIcon />
             </ToolbarButton>
             </Tooltip>

             <Menu
             id="export-menu"
             className="no-mobile"
             anchorEl={exportMenuTriggerRef.current}
             open={exportMenuOpen}
             onClose={() => setExportMenuOpen(false)}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
             slotProps={{
             list: {
             'aria-labelledby': 'export-menu-trigger',
             },
             }}
             >
             <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
             چاپ
             </ExportPrint>
             <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
             بارگیری فایل CSV
             </ExportCsv>
             </Menu>*/}

            <StyledQuickFilter debounceMs={2000}>
                <QuickFilterTrigger
                    render={(triggerProps, state) => (
                        <Tooltip title="جستجو" enterDelay={0}>
                            <StyledToolbarButton
                                {...triggerProps}
                                ownerState={{ expanded: state.expanded }}
                                color="default"
                                aria-disabled={state.expanded || isDisabled}
                            >
                                <SearchIcon fontSize="small" />
                            </StyledToolbarButton>
                        </Tooltip>
                    )}
                />
                <QuickFilterControl
                    disabled={isDisabled}
                    render={({ ref, ...controlProps }, state) => (
                        <StyledTextField
                            {...controlProps}
                            ownerState={{ expanded: state.expanded }}
                            inputRef={ref}
                            aria-label="جستجو"
                            placeholder="جستجو..."
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: state.value ? (
                                        <InputAdornment position="end">
                                            <QuickFilterClear
                                                edge="end"
                                                size="small"
                                                aria-label="Clear search"
                                                material={{ sx: { marginRight: -0.75 } }}
                                            >
                                                <XIcon />
                                            </QuickFilterClear>
                                        </InputAdornment>
                                    ) : null,
                                    ...controlProps.slotProps?.input,
                                },
                                ...controlProps.slotProps,
                            }}
                        />
                    )}
                />
            </StyledQuickFilter>
        </Toolbar>
    );
}