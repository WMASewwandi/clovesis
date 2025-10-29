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

const CreateContactCRM = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [lifeCycleStageOptions, setLifeCycleStageOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [lifeCycleStage, setLifeCycleStage] = useState(null); 
  const [tags, setTags] = useState([]); 
  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");

  useEffect(() => {
    if (apiResponse) {
      if (apiResponse.lifeCycleStages) {
        const stages = Object.entries(apiResponse.lifeCycleStages).map(
          ([key, value]) => ({
            key: parseInt(key, 10),
            value,
          })
        );
        setLifeCycleStageOptions(stages);
        const defaultStage = stages.find((s) => s.value === "Subscriber");
        if (defaultStage) {
          setLifeCycleStage(defaultStage);
        }
      }
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
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !lifeCycleStage ||
      tags.length === 0 
    ) {
      toast.error(
        "Please fill in all required fields: First Name, Last Name, Email, Phone, Lifecycle, and at least one Tag."
      );
      return;
    }

    const contactCRMData = {
      firstname,
      lastname,
      email,
      phone,
      title,
      lifeCycleStage: lifeCycleStage?.key || 0,
      tags: tags.map(t => t.key),
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BASE_URL}/ContactCRM/CreateContactCRM`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(contactCRMData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Contact created successfully!");
        setTimeout(() => router.push("/crm/contact"), 1500);
      } else if (response.status === 400 || response.status === 409) {
        toast.warn(result.message || "Failed to create contact.");
      } else {
        toast.error(result.message || "Failed to create contact.");
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
        <h1>New Contact</h1>
        <ul>
                  <li>
                    <Link href="/crm/contact">Contact</Link>
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
                onClick={() => router.push("/crm/contact")}
              >
                Go Back
              </Button>
            </Grid>

            {/* --- Fields --- */}
            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                First Name*
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Last Name*
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Email*
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                size="small"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Title
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Lifecycle Stage*
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={lifeCycleStageOptions}
                getOptionLabel={(option) => option.value || ""}
                isOptionEqualToValue={(option, value) =>
                  option.key === value.key
                }
                loading={enumsLoading}
                value={lifeCycleStage}
                onChange={(event, newValue) => setLifeCycleStage(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    placeholder="Select Lifecycle Stage"
                  />
                )}
              />
            </Grid>

            {/* --- CHANGED: Updated Tags Field --- */}
            <Grid item xs={12} md={2}>
              <Typography component="label" fontWeight="bold">
                Tags*
              </Typography>
            </Grid>
            <Grid item xs={12} md={10}>
              <Autocomplete
                multiple // Added this
                options={tagOptions}
                getOptionLabel={(option) => option.value || ""}
                isOptionEqualToValue={(option, value) =>
                  option.key === value.key
                }
                loading={enumsLoading}
                value={tags} // Was 'tag'
                onChange={(event, newValues) => setTags(newValues)} // Was 'newValue' and 'setTag'
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    placeholder="Select Tags" // Updated placeholder
                  />
                )}
              />
            </Grid>
            {/* --- End of Updated Field --- */}

            <Grid item xs={12}>
              <LoadingButton
                loading={isSubmitting}
                size="small"
                handleSubmit={handleSubmit}
                text="Create Contact"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateContactCRM;