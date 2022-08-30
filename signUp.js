import {
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Input,
} from "@mui/material";
import { lightBlue, grey } from "@mui/material/colors";
import LoginAvatar from "../components/login/loginAvatar";
import LoginInput from "../components/login/loginInput";
import LoadingDialog from "../components/authentication/loadingDialog";
import AccountBoxSharpIcon from "@mui/icons-material/AccountBoxSharp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { getCsrfToken, signIn, getSession } from "next-auth/react";
import * as yup from "yup";
import YupPassword from "yup-password";
import { PasswordCheckBox } from "../components/login/passwordCheckBox";
import { useRouter } from "next/router";
import sendEmailToApi from "../utils/newUserConfigurationEmail";
YupPassword(yup);

const topContainerStyle = {
  my: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  border: "0.5px solid grey",
  borderRadius: "4px",
  p: 2,
};

const validationSchema = yup.object({
  firstName: yup.string("Enter your First Name").required("Name is required"),
  lastName: yup.string("Enter your last Name").required("Name is required"),
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(10, "A minimum 10 characters is required")
    .minLowercase(6, "At least 6 lower letters are required")
    .minUppercase(1, "At least 1 upper letter is required")
    .minNumbers(2, "At least 2 number character is required")
    .minSymbols(1, "At least 1 symbol character is required")
    .required("Password is required"),
  passwordAgain: yup
    .string("Enter your password")
    .oneOf([yup.ref("password"), ""], "password must match")
    .required("Password is required")
    .min(10, "A minimum 10 characters is required"),
});

function SignUpComponent(props) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const { push } = useRouter();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordAgain: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const { firstName, lastName, email, password, passwordAgain } = values;
      const fname =
        firstName.slice(0, 1).toLocaleUpperCase() + firstName.slice(1);
      const lname =
        lastName.slice(0, 1).toLocaleUpperCase() + lastName.slice(1);
      const name = `${fname} ${lname}`;
      if (password === passwordAgain) {
        setLoading(true);
        const response = await axios({
          method: "POST",
          url: "/api/auth/signup",
          data: {
            name,
            password,
            email,
          },
          headers: { "Content-Type": "application/json" },
        });
        //console.log("mydata", response);
        const { data } = response;
        console.log("data", data);
        if (data.message === "success") {
          const res = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
            callbackUrl: `${window.location.origin}/dashboard`,
          });
          console.log("mydata", res);
          if (res?.error) {
            //
            setError("Wrong Credentials");
          } else if (res?.url && res?.status === 200) {
            const session = await getSession();
            if (session) {
              const {
                user: { name, email },
              } = session;
              sendEmailToApi(email, name);
            }
            push(res.url);
          }
          //setLoading(false);
          setSubmitting(false);
        }
      }
    },
  });

  const { csrfToken } = props;

  return (
    <Container component={"main"} maxWidth="xl" border={1}>
      <CssBaseline />
      {/*Can have backdrop component if required*/}
      {loading && <LoadingDialog />}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          component={"form"}
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{
            ...topContainerStyle,
            width: { xs: "80%", sm: "65%", md: "50%", lg: "35%" },
            mb: 5,
            boxShallow: 0.5,
          }}
        >
          <Input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <LoginAvatar />
          <Typography
            sx={{
              color: "black",
              fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "18px" },
            }}
            variant={matches ? "h6" : "h6"}
          >
            Sign Up
          </Typography>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "80%",
              gap: 2,
              mt: 2,
            }}
          >
            <LoginInput
              name="First Name"
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
              handleChange={formik.handleChange}
              value={formik.values.firstName}
              isStartAdorment={true}
              icon1={<AccountBoxSharpIcon />}
              position="start"
            />
            <LoginInput
              name="Last Name"
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              handleChange={formik.handleChange}
              value={formik.values.lastName}
              isStartAdorment={true}
              icon1={<AccountBoxSharpIcon />}
              position="start"
            />
          </Stack>
          <Stack sx={{ width: "80%" }}>
            <LoginInput
              name="Email"
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              handleChange={formik.handleChange}
              value={formik.values.email}
              hasAdorment={true}
              icon={<MailOutlineIcon />}
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

          <Stack sx={{ width: "80%" }}>
            <LoginInput
              name="Password Again"
              error={
                formik.touched.passwordAgain &&
                Boolean(formik.errors.passwordAgain)
              }
              helperText={
                formik.touched.passwordAgain && formik.errors.passwordAgain
              }
              handleChange={formik.handleChange}
              value={formik.values.passwordAgain}
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
              isDisabled={formik.values.password || formik.values.passwordAgain}
              checked={checked}
              onChange={handleChange}
              hidePasswordLabel={"Hide Password"}
              showPasswordLabel={"Show Password"}
            />
          </Stack>
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
          <Button
            disableElevation
            sx={{
              fontSize: { xs: "10px", sm: "12px", md: "14px", lg: "14px" },
              lineHeight: { xs: 1.2, sm: 1.5, md: 1.5, lg: 1.5 },
              mb: 4,
              bgcolor: lightBlue["A200"],

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
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUpComponent;

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
