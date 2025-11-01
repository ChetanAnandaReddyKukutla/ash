import { Box, styled, Typography, Button } from "@mui/material";
import { Container } from "@mui/system";
import React from "react";
import Navbar from "./Navbar";
import supplyChainImg from "../../img/ChatGPT Image Nov 1, 2025, 04_53_24 PM.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const HeroContainer = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    position: "relative",
    overflow: "hidden",
    overflowX: "hidden",
    paddingBottom: "100px",
    width: "100%",
    maxWidth: "100vw",
    "&::before": {
      content: '""',
      position: "absolute",
      width: "600px",
      height: "600px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
      top: "-200px",
      right: "-200px",
      animation: "pulse 8s ease-in-out infinite",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      width: "500px",
      height: "500px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
      bottom: "-150px",
      left: "-150px",
      animation: "pulse 10s ease-in-out infinite",
      animationDelay: "2s",
    },
    "@keyframes pulse": {
      "0%, 100%": {
        opacity: 1,
        transform: "scale(1)",
      },
      "50%": {
        opacity: 0.8,
        transform: "scale(1.05)",
      },
    },
    "@keyframes float": {
      "0%, 100%": {
        transform: "translateY(0px)",
      },
      "50%": {
        transform: "translateY(-20px)",
      },
    },
    "@keyframes fadeInUp": {
      from: {
        opacity: 0,
        transform: "translateY(30px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
    "@keyframes bounce": {
      "0%, 100%": {
        transform: "translateY(0)",
      },
      "50%": {
        transform: "translateY(-10px)",
      },
    },
    "@keyframes scroll": {
      "0%": {
        opacity: 1,
        transform: "translateY(0)",
      },
      "100%": {
        opacity: 0,
        transform: "translateY(20px)",
      },
    },
  }));

  const ContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(10),
    marginTop: theme.spacing(8),
    position: "relative",
    zIndex: 1,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      textAlign: "center",
      gap: theme.spacing(5),
      marginTop: theme.spacing(4),
    },
  }));

  const LeftContent = styled(Box)(({ theme }) => ({
    flex: "1 1 500px",
    animation: "fadeInUp 0.8s ease-out",
    [theme.breakpoints.down("md")]: {
      flex: "1 1 100%",
    },
  }));

  const RightContent = styled(Box)(({ theme }) => ({
    flex: "1 1 500px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "fadeInUp 0.8s ease-out 0.2s backwards",
    [theme.breakpoints.down("md")]: {
      flex: "1 1 100%",
    },
  }));

  const Title = styled(Typography)(({ theme }) => ({
    fontSize: "4rem",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: theme.spacing(2),
    color: "#f1f5f9",
    letterSpacing: "-0.02em",
    [theme.breakpoints.down("md")]: {
      fontSize: "3rem",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.5rem",
    },
  }));

  const GradientText = styled("span")({
    background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  });

  const GradientButton = styled(Button)(({ theme }) => ({
    padding: "16px 40px",
    fontSize: "1.125rem",
    fontWeight: "600",
    borderRadius: "12px",
    textTransform: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 40px rgba(99, 102, 241, 0.4)",
      background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    },
  }));

  const OutlinedButton = styled(Button)(({ theme }) => ({
    padding: "16px 40px",
    fontSize: "1.125rem",
    fontWeight: "600",
    borderRadius: "12px",
    textTransform: "none",
    color: "#e2e8f0",
    border: "2px solid #475569",
    background: "transparent",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-2px)",
      borderColor: "#64748b",
    },
  }));

  const ImageContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    animation: "float 6s ease-in-out infinite",
  }));

  const ScrollIndicator = styled(Box)({
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    cursor: "pointer",
    zIndex: 10,
  });

  const Mouse = styled(Box)({
    width: "30px",
    height: "50px",
    border: "2px solid #64748b",
    borderRadius: "15px",
    position: "relative",
    animation: "bounce 2s ease-in-out infinite",
    "&::before": {
      content: '""',
      width: "4px",
      height: "10px",
      background: "#64748b",
      borderRadius: "2px",
      position: "absolute",
      top: "8px",
      left: "50%",
      transform: "translateX(-50%)",
      animation: "scroll 2s ease-in-out infinite",
    },
  });

  return (
    <HeroContainer>
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        
        <ContentBox>
          <LeftContent>
            <Typography
              variant="overline"
              sx={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#a78bfa",
                letterSpacing: "2px",
                marginBottom: "20px",
                display: "block",
              }}
            >
              🔐 SECURE • TRANSPARENT • IMMUTABLE
            </Typography>
            
            <Title variant="h1">
              <GradientText>Blockchain-Powered</GradientText>
              <br />
              Product Verification
            </Title>
            
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: "600",
                color: "#cbd5e1",
                mb: 3,
                letterSpacing: "0.02em",
              }}
            >
              Scan. Verify. Trust
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: "1.8",
                color: "#94a3b8",
                mb: 5,
                maxWidth: "600px",
              }}
            >
              Protect your products and your trust with immutable supply-chain records.
              Our blockchain-based verification system provides an easy and secure way
              to authenticate every item from source to shelf.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 4,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <GradientButton onClick={() => navigate('/login')}>
                Get Started →
              </GradientButton>
              <OutlinedButton onClick={scrollToContent}>
                Learn More
              </OutlinedButton>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {[
                { icon: "⚡", text: "Lightning Fast" },
                { icon: "🔒", text: "Highly Secure" },
                { icon: "🌍", text: "Global Network" },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    padding: "10px 20px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#e2e8f0",
                    background: "rgba(51, 65, 85, 0.6)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "50px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {feature.icon} {feature.text}
                </Box>
              ))}
            </Box>
          </LeftContent>

          <RightContent>
            <ImageContainer>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "120%",
                  height: "120%",
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(60px)",
                  animation: "pulse 4s ease-in-out infinite",
                }}
              />
              <Box
                component="img"
                src={supplyChainImg}
                alt="Blockchain Supply Chain"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "24px",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
                }}
              />
              
              {/* Floating Elements */}
              {[
                { icon: "📦", top: "10%", right: "-5%", delay: "0s" },
                { icon: "✓", bottom: "15%", left: "-5%", delay: "1s" },
                { icon: "🔗", top: "50%", right: "-10%", delay: "2s" },
              ].map((element, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "absolute",
                    top: element.top,
                    bottom: element.bottom,
                    left: element.left,
                    right: element.right,
                    width: "60px",
                    height: "60px",
                    background: "rgba(99, 102, 241, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                    animation: `float ${3 + index}s ease-in-out infinite`,
                    animationDelay: element.delay,
                  }}
                >
                  {element.icon}
                </Box>
              ))}
            </ImageContainer>
          </RightContent>
        </ContentBox>
      </Container>

      <ScrollIndicator onClick={scrollToContent}>
        <Mouse />
      </ScrollIndicator>
    </HeroContainer>
  );
};

export default Hero;
