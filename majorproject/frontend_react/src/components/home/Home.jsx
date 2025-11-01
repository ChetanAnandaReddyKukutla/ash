import Hero from "./Hero";
import Guide from "./Guide";
import Companies from "./Companies";
import GetStarted from "./GetStarted";
import Footer from "./Footer";
import { Box } from "@mui/material";

const Home = () => {
    return (
        <Box sx={{ 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            minHeight: "100vh",
            width: "100%",
            maxWidth: "100vw",
            overflowX: "hidden",
        }}>
        <Hero />
        <Guide />
        <Companies />
        <GetStarted />
        <Footer />
        </Box>
    );
}

export default Home;