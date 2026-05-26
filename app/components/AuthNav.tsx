import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";

import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function AuthNav() {
  const session = await auth();

  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full border-0 bg-white px-3 text-xs shadow-[0_2px_12px_rgb(0,0,0,0.06)]"
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-full"
            />
          ) : null}
          <span className="hidden max-w-[8rem] truncate sm:inline">
            {session.user.name ?? session.user.email ?? "บัญชี"}
          </span>
          <LogOut className="size-3.5 shrink-0" />
        </Button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 rounded-full border-0 bg-white px-3 text-xs shadow-[0_2px_12px_rgb(0,0,0,0.06)]"
      >
        <LogIn className="size-3.5" />
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
