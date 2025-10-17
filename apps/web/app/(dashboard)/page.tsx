"use client";
import {
  useMutation,
  useQuery,
} from "convex/react";
import { OrganizationSwitcher, UserButton} from "@clerk/nextjs"
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import { Input } from "@workspace/ui/components/input";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const add = useMutation(api.users.add);
  const [name, setName] = useState("");

  async function onAdd() {
    const user = await add({ name: name });
    console.log(user);
  }

  console.log(users);

  return (
    <>
        <div className="">
          <Button>Add User</Button>
        </div>
    </>
  );
}
