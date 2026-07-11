import { SignInButton, SignOutButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button"; 

export default function Home() {

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <UserButton/>
    </div>
  );
}