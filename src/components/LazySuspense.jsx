import { Suspense } from "react";
import { Backdrop, Stack } from "@mui/material";
import GradientCircularProgress from "./GradientCircularProgress.jsx";

export default function LazySuspense({children}) {
    return <Suspense fallback={
        <Stack direction="column" alignItems="center" justifyContent="center" gap={2}>
            <GradientCircularProgress size={60}/>
        </Stack>
    }>
        {children}
    </Suspense>
}