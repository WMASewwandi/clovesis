import React, { useState, useEffect } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "@/styles/PageTitle.module.css";
import BASE_URL from "Base/api";
import useApi from "@/components/utils/useApi";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";


const CreateAccount = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [tagOptions, setTagOptions] = useState([]);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [size, setSize] = useState(""); 
  const [annualRevenue, setAnnualRevenue] = useState(""); 
  const [tags, setTags] = useState([]); 
  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + 
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
    '((\\d{1,3}\\.){3}\\d{1,3}))' + 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + 
    '(\\?[;&a-z\\d%_.~+=-]*)?' + 
    '(\\#[-a-z\\d_]*)?$', 
    'i'
  );

  useEffect(() => {
    if (apiResponse) {
      if (apiResponse.leadTags) {
        const tags = Object.entries(apiResponse.leadTags).map(
          ([key, value]) => ({
            key: parseInt(key, 10),
            value,
          })
        );
        setTagOptions(tags);
      }
    }
  }, [apiResponse]);

  const handleSubmit = async () => {
    if (
      !name ||
      !phone ||
      tags.length === 0 
    ) {
      toast.error(
        "Please fill in all required fields: Name, Phone, and at least one Tag."
      );
      return;
    }

    if (website && !urlPattern.test(website)) {
      toast.warn("Invalid website URL type.");
      return;
    }

    const accountData = {
      name,
      industry: industry || null,
      website: website || null,
      phone,
      billingAddress: billingAddress || null,
      shippingAddress: shippingAddress || null,
      size: size ? parseInt(size, 10) : null, 
      annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
      tags: tags.map(t => t.key),
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BASE_URL}/Account/CreateAccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(accountData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => router.push("/crm/account"), 1500);
      } else if (response.status === 400 || response.status === 409) {
        toast.warn(result.message || "Failed to create account.");
      } else {
        toast.error(result.message || "Failed to create account.");
      }
    } catch (error) {
      toast.error("An error occurred while connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>New Account</h1>
        <ul>
                  <li>
                    <Link href="/crm/account">Account</Link>
                  </li>
                  <li>Create</li>
                </ul>
      </div>

      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ background: "#fff", padding: "15px", borderRadius: "8px" }}
          >
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => router.push("/crm/account")}
              >
                Go Back
              </Button>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Name*
              </Typography>
            </Grid>
            <Grid item xs={12} md={10}> 
              <TextField
                fullWidth
                required
                size="small"
                placeholder="Account Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Industry
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Website
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="https://example.com"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Phone*
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Billing Address
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Billing Address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Shipping Address
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </Grid>

             <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Size
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Number of Employees"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Annual Revenue
              </Typography>
            </Grid>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                size="small"
                placeholder="Annual Revenue"
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Tags*
              </Typography>
            </Grid>
            <Grid item xs={12} md={10}>
              <Autocomplete
                multiple 
                options={tagOptions}
                getOptionLabel={(option) => option.value || ""}
                isOptionEqualToValue={(option, value) =>
                  option.key === value.key
                }
                loading={enumsLoading}
                value={tags} 
                onChange={(event, newValues) => setTags(newValues)} 
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    placeholder="Select Tags" 
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <LoadingButton
                loading={isSubmitting}
                size="small"
                handleSubmit={handleSubmit}
                text="Create Account"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateAccount;