import React, { useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ResumeUpload from "./ResumeUpload";
import JobDescription from "./JobDescription";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

function CreateInterviewDialog() {
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const {userDetail,setUserDetail}=useContext(UserDetailContext)
  const router=useRouter();
  const saveInterviewQuestion=useMutation(api.Interview.SaveInterviewQuestion)
  const onHandleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async () => {
    // if (!file) return;
    setLoading(true);

    const uploadData = new FormData();
   if (file) {
  uploadData.append("file", file);
}
uploadData.append("jobTitle", formData?.jobTitle || "");
uploadData.append("jobDescription", formData?.jobDescription || "");

    
    try {
      const res = await axios.post("/api/generate-interview-question", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Upload success:", res.data);
      //Save to DB

      if(res?.data?.status==429){
        console.log(res?.data?.result)
        return;
      }

    const resp = await saveInterviewQuestion({
  question: res.data?.questions,
  resumeUrl: res?.data.resumeUrl,
  uid: userDetail?._id,
  jobTitle: formData?.jobTitle || null,
  jobDescription: formData?.jobDescription || null
});

      console.log(resp)
      router.push('/interview/'+resp)
      
    } catch (error) {
      console.error("❌ Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>+ Create Interview</Button>
      </DialogTrigger>
      <DialogContent className="w-[0vw] sm:min-w-[600px] md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Please Submit following details.</DialogTitle>
          <DialogDescription>
            <Tabs defaultValue="resume-upload" className="w-[500px]">
              <TabsList>
                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
              </TabsList>
              <TabsContent value="resume-upload">
                <ResumeUpload setFiles={(file: File) => setFile(file)} />
              </TabsContent>
              <TabsContent value="job-description">
                <JobDescription onHandleInputChange={onHandleInputChange} />
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-6">
          <DialogClose>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
           <Button
    onClick={onSubmit}
    disabled={
      loading ||
      (!file && (!formData?.jobTitle || !formData?.jobDescription))
    }
  >
    {loading && <Loader2Icon className="animate-spin mr-2" />}
    Submit
  </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
