import { styled, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React from "react";

import fbIcon from "../../img/fbicon.png";
import twitterIcon from "../../img/twittericon.png";
import linkedinIcon from "../../img/linkedinicon.png";

const Footer = () => {
  const CustomContainer = styled(Container)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-around",
    gap: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  }));

  const IconBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  }));

  const FooterLink = styled("span")(({ theme }) => ({
    fontSize: "16px",
    color: "#94a3b8",
    fontWeight: "300",
    cursor: "pointer",
    "&:hover": {
      color: "#e2e8f0",
    },
  }));

  return (
    <Box sx={{ 
      py: 10,
      px: 2,
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      borderTop: "1px solid rgba(148, 163, 184, 0.2)",
    }}>
      <CustomContainer>
        <CustomContainer>
          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                color: "#f1f5f9",
                fontWeight: "700",
                mb: 2,
              }}
            >
              Products
            </Typography>

            <FooterLink>Product Verification</FooterLink>
            <br />
            <FooterLink>Supply Chain Tracking</FooterLink>
            <br />
            <FooterLink>Anti-Counterfeiting</FooterLink>
            <br />
            <FooterLink>Smart Contracts</FooterLink>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                color: "#f1f5f9",
                fontWeight: "700",
                mb: 2,
              }}
            >
              Resources
            </Typography>

            <FooterLink>How It Works</FooterLink>
            <br />
            <FooterLink>Case Studies</FooterLink>
            <br />
            <FooterLink>Blog</FooterLink>
            <br />
            <FooterLink>Whitepaper</FooterLink>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                color: "#f1f5f9",
                fontWeight: "700",
                mb: 2,
              }}
            >
              Company
            </Typography>

            <FooterLink>About Us</FooterLink>
            <br />
            <FooterLink>Partnerships</FooterLink>
            <br />
            <FooterLink>Terms of Use</FooterLink>
            <br />
            <FooterLink>Privacy Policy</FooterLink>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                color: "#f1f5f9",
                fontWeight: "700",
                mb: 2,
              }}
            >
              Get in touch
            </Typography>

            <Typography
              sx={{
                fontSize: "16px",
                color: "#94a3b8",
                fontWeight: "500",
                mb: 2,
              }}
            >
              Let us help you find the perfect solution for your needs. 
            </Typography>

            <IconBox>
              <img src={fbIcon} alt="fbIcon" style={{ cursor: "pointer" }} />
              <img
                src={twitterIcon}
                alt="twitterIcon"
                style={{ cursor: "pointer" }}
              />
              <img
                src={linkedinIcon}
                alt="linkedinIcon"
                style={{ cursor: "pointer" }}
              />
            </IconBox>
          </Box>
        </CustomContainer>
      </CustomContainer>
    </Box>
  );
};

export default Footer;
