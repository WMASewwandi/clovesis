import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";
import useApi from "@/components/utils/useApi";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";

const CreateLead = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [stageOptions, setStageOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  // Form field states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [leadScore, setLeadScore] = useState("");
  const [stage, setStage] = useState(null);
  const [tags, setTags] = useState([]);

  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");

  useEffect(() => {
    if (apiResponse && apiResponse.leadStages) {
      const stages = Object.values(apiResponse.leadStages || {});
      const tags = Object.values(apiResponse.leadTags || {});
      
      setStageOptions(stages);
      setTagOptions(tags);

      const defaultStage = stages.find(s => s === "New");
      if (defaultStage) {
        setStage(defaultStage);
      }
    }
  }, [apiResponse]);

  const handleSubmit = async () => {
    if (!firstName || !company || !stage) {
      toast.error("Please fill in First Name, Company, and Stage.");
      return;
    }

    const leadData = { 
        firstName, 
        lastName, 
        company, 
        email, 
        phone, 
        source, 
        leadScore: Number(leadScore) || 0, 
        stage, 
        tags 
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BASE_URL}/Leads/CreateLead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Lead created successfully!");
        setTimeout(() => router.push("/crm/lead"), 1500);
      } else if (response.status === 409) {
        toast.warn(result.message || "This email is already in use.");
      } else {
        toast.error(result.message || "Failed to create lead.");
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
        <h1>New Lead</h1>
         <ul>
            <li>
              <Link href="/crm/lead">Lead</Link>
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
            sx={{ background: "#fff", padding: "20px", borderRadius: "8px" }}
          >
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.push("/crm/lead")}>Go Back</Button>
            </Grid>

     
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">First Name</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Grid>
            
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Last Name</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></Grid>

            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Company</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} /></Grid>
            
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Stage</Typography></Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
              
                options={stageOptions}
                loading={enumsLoading}
                value={stage}
                onChange={(event, newValue) => setStage(newValue)}
                renderInput={(params) => <TextField {...params} size="small" placeholder="Select Stage" />}
              />
            </Grid>

          
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Email</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth  size="small" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>

            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Phone</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small"  placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Grid>
            
          
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Source</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} /></Grid>
            
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Lead Score</Typography></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" placeholder="0" type="number" value={leadScore} onChange={(e) => setLeadScore(e.target.value)}/></Grid>
            
            <Grid item xs={12} md={2}><Typography component="label" fontWeight="bold">Tags</Typography></Grid>
            <Grid item xs={12} md={10}>
              <Autocomplete
                multiple
                
                options={tagOptions}
                loading={enumsLoading}
                value={tags}
                onChange={(event, newValues) => setTags(newValues)}
                renderInput={(params) => <TextField {...params} size="small" placeholder="Select tags" />}
              />
            </Grid>

        
            <Grid item xs={12}>
              <LoadingButton loading={isSubmitting} size="small" handleSubmit={handleSubmit} text="Create Lead"/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateLead;