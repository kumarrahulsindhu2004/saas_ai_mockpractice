// app/context/UserDetailContext.tsx
"use client";
import React, { createContext, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export const UserDetailContext = createContext<any>(null);

export const UserDetailProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);
  const createNewUser = useMutation(api.users.CreateNewUser);

  useEffect(() => {
    const createOrFetchUser = async () => {
      if (user) {
        const response = await createNewUser({
          name: user.fullName || "Anonymous",
          email: user.primaryEmailAddress?.emailAddress || "",
          imageUrl: user.imageUrl || "",
        });
        setUserDetail(response);
      }
    };
    createOrFetchUser();
  }, [user]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};
