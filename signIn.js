import {
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  SvgIcon,
  Paper,
  Backdrop,
  Input,
} from "@mui/material";
import { Link as MuiLink } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
//import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import { lightBlue, red, grey } from "@mui/material/colors";
import LoginAvatar from "../components/login/loginAvatar";
import LoginInput from "../components/login/loginInput";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

import { setHasAlreadySignup } from "../stores/signup";
import { useDispatch } from "react-redux";
import { signIn, getCsrfToken, getSession } from "next-auth/react";

import LoadingDialog from "../components/authentication/loadingDialog";
import { PasswordCheckBox } from "../components/login/passwordCheckBox";
import sendEmailToApi from "../utils/newUserConfigurationEmail";

const topContainerStyle = {
  my: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  //border: "1px solid grey",
  borderRadius: "4px",
  p: 2,
};

const innerBoxContainerThree = {
  display: "flex",
  width: "80%",
  flexDirection: "row",
  justifyContent: "space-between",
  p: 2,
};

const innerBoxContainerTwo = {
  width: "80%",
  boxSizing: "border-box",
  mt: 1,
  display: "flex",
  flexDirection: "column",
};

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(10, "A minimum 8 characters is required")
    .minLowercase(6, "At least 6 lower letters are required")
    .minUppercase(1, "At least 1 upper letter is required")
    .minNumbers(2, "At least 2 number character is required")
    .minSymbols(1, "At least 1 symbol character is required")
    .required("Password is required"),
});

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: "center",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  width: "80%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  border: "1px solid grey",
}));

const SigninTypography = styled(Typography)(({ theme }) => ({
  color: "black",
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  marginTop: theme.spacing(0.5),
}));

function SignInComponent(props) {
  const { csrfToken } = props;
  const { push } = useRouter();

  //const { status } = useSession({ required: true })

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  //const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleClickAuthSignIn = (provider) => async (event) => {
    event.preventDefault();

    setLoading(true);
    //setOpen(true);
    const res = await signIn(provider, {
      redirect: false,
      callbackUrl: `${window.location.origin}/dashboard`,
    });

    //const session = await getSession();
    if (res?.error) {
      setError("Wrong Credentials");
    } else if (res?.status === 200 && res?.url) {
      const session = await getSession();
      if (session) {
        //console.log("my session", session);
        const {
          isNewUser,
          user: { name, email },
        } = session;
        if (isNewUser === true) {
          sendEmailToApi(email, name);
        }
        //setLoading(false);

        push(`${res.url}`);
      }
    }
  };

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  const dispatch = useDispatch();
  function handleClick() {
    dispatch(setHasAlreadySignup());
  }

  const theme = useTheme();

  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      const { email, password } = values;
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: `${window.location.origin}/dashboard`,
      });

      if (res?.error) {
        setError("Wrong Credentials");
      } else if (res.url && res.status === 200) {
        push(res.url);
      }
      // need to be fix this section
      setSubmitting(false);
    },
  });

  return (
    <Container
      component={"main"}
      maxWidth="xl"
      border={1}
      //sx={{ backdropFilter: "blur(20px)", color: "transparent" }}
    >
      <CssBaseline />

      {loading && (
        <Backdrop
          sx={{
            bgcolor: "transparent",
            //color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: "flex",
            justifyContent: "center",
          }}
          open={true}
          //onClick={handleClose}
        >
          <LoadingDialog />
        </Backdrop>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          //border: "solid black",
        }}
      >
        <Box
          component={"form"}
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{
            ...topContainerStyle,
            width: { xs: "80%", sm: "65%", md: "50%", lg: "35%" },
            mb: 5,
            overflow: "auto",
            boxShadow: 0.5,
            border: "0.5px solid grey",
          }}
        >
          <Input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <LoginAvatar />
          <Typography
            sx={{
              my: 1,
              color: "black",
              fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "18px" },
            }}
            variant={matches ? "body2" : "h6"}
            data-testid="signin-typo-h6"
          >
            Sign In
          </Typography>

          <Stack sx={{ width: "80%" }}>
            <LoginInput
              name="Email"
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              handleChange={formik.handleChange}
              value={formik.values.email}
              hasAdorment={true}
              icon={<MailOutlineIcon />}
              position="start"
            />
          </Stack>
          <Stack sx={{ width: "80%" }}>
            <LoginInput
              name="Password"
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              handleChange={formik.handleChange}
              value={formik.values.password}
              hasAdorment={false}
              isChecked={checked}
            />
          </Stack>
          <Stack
            sx={{
              width: "80%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <PasswordCheckBox
              isDisabled={formik.values.password}
              checked={checked}
              onChange={handleChange}
              hidePasswordLabel={"Hide Password"}
              showPasswordLabel={"Show Password"}
              sx={{
                fontSize: { xs: "12px", sm: "12px", md: "14px", lg: "14px" },
              }}
            />
          </Stack>

          <Button
            disableElevation
            sx={{
              fontSize: { xs: "10px", sm: "12px", md: "14px", lg: "14px" },
              lineHeight: { xs: 1.2, sm: 1.5, md: 1.5, lg: 1.5 },

              mb: 1,
              bgcolor: lightBlue["A200"],
              //opacity: "0.8",
              width: "80%",
              ":hover": {
                bgcolor: grey["800"],
                color: "white",
                border: "0.5px solid grey",
              },
            }}
            variant="contained"
            type="submit"
          >
            Sign In
          </Button>
          {error && (
            <Box
              sx={{
                color: "red",
                width: "80%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {error}
            </Box>
          )}
          <Box sx={{ ...innerBoxContainerTwo }}>
            <Box
              sx={{
                textAlign: "center",
                color: "black",
                my: 2,
                fontSize: { xs: "12px", sm: "14px", md: "14px", lg: "16px" },
                //fontWeight: { xs: 300, sm: 300, md: 320, lg: 350 },
                //lineHeight: { xs: 1.2, sm: 1.5, md: 1.5, lg: 1.5 },
              }}
              component="Typography"
              variant={matches ? "body2" : "body1"}
            >
              Alternative Sign-In options:
            </Box>
            <Stack
              sx={{
                alignItems: "center",
                flexDirection: "Column",
                flexWrap: "wrap",
                justifyContent: "space-around",
              }}
            >
              <Item
                sx={{ boxShadow: 0 }}
                onClick={handleClickAuthSignIn("google")}
              >
                <SvgIcon
                  sx={{
                    color: red["500"],
                    fontSize: { xs: 15, sm: 20, md: 30 },
                  }}
                >
                  {" "}
                  <GoogleIcon
                  //fontSize={{ xs: "small", sm: "medium" }}
                  //sx={{ fontSize: { xs: 15, sm: 30 } }}
                  />
                </SvgIcon>
                <SigninTypography
                  sx={{
                    fontSize: {
                      xs: "10px",
                      sm: "12px",
                      md: "14px",
                      lg: "14px",
                    },
                  }}
                >
                  Sign in with Google
                </SigninTypography>
              </Item>

              <Item
                sx={{ boxShadow: 0 }}
                onClick={handleClickAuthSignIn("facebook")}
              >
                <SvgIcon
                  sx={{
                    color: "#01579b",
                    fontSize: { xs: 15, sm: 20, md: 30 },
                  }}
                >
                  {" "}
                  <FacebookOutlinedIcon />
                </SvgIcon>
                <SigninTypography
                  sx={{
                    fontSize: {
                      xs: "10px",
                      sm: "12px",
                      md: "14px",
                      lg: "14px",
                    },
                  }}
                >
                  Sign in with Facebook
                </SigninTypography>
              </Item>
              {/*<Item  sx={{ boxShadow: 0}} onClick={handleClickAuthSignIn("github")}><SvgIcon sx={{color:"black"}}> <GitHubIcon/></SvgIcon>
           <SigninTypography >Sign in with Github</SigninTypography></Item>*/}
            </Stack>
          </Box>

          <Box sx={{ ...innerBoxContainerThree }}>
            <MuiLink
              onClick={() => handleClick()}
              href="/authentication"
              component="button"
              variant={matches ? "body2" : "body1"}
              underline="hover"
              sx={{
                fontSize: { xs: "10px", sm: "12px", md: "14px", lg: "14px" },
                color: "#1565c0",
              }}
            >
              Create New Account?
            </MuiLink>

            <MuiLink
              onClick={() => push("/authentication/passwordrecreation")}
              component="button"
              variant={matches ? "body2" : "body1"}
              underline="hover"
              sx={{
                fontSize: { xs: "10px", sm: "12px", md: "14px", lg: "14px" },
                color: "#1565c0",
              }}
            >
              Forgot Password?
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default SignInComponent;

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
