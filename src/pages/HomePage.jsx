import { logDevHigh } from "../core/Utils.js";
import { Box, Card, Grid } from "@mui/material";
import DatabaseUsageBar from "../components/DatabaseUsageBar.jsx";
import React from "react";
import { Masonry } from "@mui/lab";
import HeapUsageMonitor from "../components/HeapUsageMonitor.jsx";
import DataTypeChar from "../components/DataTypeChar.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import Spacer from "../components/Spacer.jsx";
import CardWithIcon from "../components/CardWithIcon.jsx";
import { IconSnowflake, IconBalloon, IconBrandGithub } from "@tabler/icons-react";
import StatsOverview from "../components/StatsOverview.jsx";
import DBActions from "../components/DBActions.jsx";

export default function HomePage(){

    logDevHigh("[PageRender] Home");

    const { __ } = useTranslate();

    return (<>

        <Grid columns={12} spacing={2} container>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 9 }}>

                <Grid spacing={1} columns={12} container>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <CardWithIcon title={__("app_name")}
                                      subtitle={__("developed_by_amatris")}
                                      icon={IconSnowflake}
                                      href="https://amatris.com"
                                      openInNewTab={true}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <CardWithIcon title={__("open_source")}
                                      subtitle={__("do_whatever") + "!"}
                                      icon={IconBrandGithub}
                                      href="https://github.com/Ho3ein83/snowflake-db"
                                      openInNewTab={true}
                                      iconColor="text"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <CardWithIcon title={__("lightweight")}
                                      subtitle={__("fast_and_light")}
                                      icon={IconBalloon}
                                      iconColor="blue"
                        />
                    </Grid>

                </Grid>

                <Spacer space={8}/>

                <Masonry columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}>

                    <Card>
                        <HeapUsageMonitor/>
                    </Card>

                    <Card>
                        <DataTypeChar />
                    </Card>

                    <Card>
                        <DBActions/>
                    </Card>

                </Masonry>

            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 3 }}>

                <Card>
                    <Box sx={{ padding: 2 }}>
                        <DatabaseUsageBar/>
                    </Box>
                </Card>

                <Spacer space={16}/>

                <Card>
                    <StatsOverview />
                </Card>

            </Grid>

        </Grid>

    </>);

}