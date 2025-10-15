"use client";
import {
  useMutation,
  useQuery,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import {SignInButton, UserButton} from "@clerk/nextjs"
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
      <Authenticated>
        <div className="flex flex-col w-2xl items-center justify-center min-h-svh">
          <UserButton />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Button onClick={onAdd}>Add</Button>
          <div>
            {users?.map((user: any) => (
              <div key={user.id}>{user.name}</div>
            ))}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignInButton>Sign in</SignInButton>
      </Unauthenticated>
    </>
  );
}
