import { Avatar, Box, Card, CardActionArea, Skeleton, Stack, Typography } from "@mui/material";

export function CardWithIconSkeleton(){
    return (<Card sx={{ padding: 2 }}>
        <Stack direction="row" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={60} height={60} />
            <Stack direction="column" gap={.5} flex={1}>
                <Skeleton variant="text" width="70%" height={24}/>
                <Skeleton variant="text" width="30%" height={24}/>
            </Stack>
        </Stack>
    </Card>);
}

export default function CardWithIcon({
                                         title,
                                         subtitle = null,
                                         href = null,
                                         openInNewTab = false,
                                         icon: Icon,
                                         iconColor = "primary",
                                         loading = false
                                     }) {

    const colors = {
        primary: "var(--sfd-primary)",
        secondary: "var(--sfd-secondary)",
        red: "var(--sfd-color-error)",
        green: "var(--sfd-color-success)",
        blue: "var(--sfd-color-info)",
        orange: "var(--sfd-color-warning)",
        text: "var(--sfd-text-color)",
    }

    const Container = href ? CardActionArea : Box;

    if(loading)
        return <CardWithIconSkeleton />

    return (<Card>
        <Container href={href} target={href && openInNewTab ? "_blank" : null} sx={{ padding: 2 }}>
            <Stack direction="row" alignItems="center" gap={2}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: colors[iconColor] ?? "var(--sfd-primary)", color: iconColor === "text" ? "var(--sfd-bg-color)" : "white" }}>
                    {Icon ? <Icon size={40} stroke={1}/> : null}
                </Avatar>
                <Stack direction="column" gap={.5}>
                    <Typography variant="h4">{title}</Typography>
                    {subtitle !== null ? <Typography variant="body1" className="waiting">{subtitle}</Typography> : null}
                </Stack>
            </Stack>
        </Container>
    </Card>);

}