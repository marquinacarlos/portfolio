import Link from "next/link";
import Image from "next/image"

import profilePicture from "@/public/carlos-marquina-profile-picture-old.png"
import logo from "@/public/vercel.svg"

export default function HeaderDraft() {
  console.log(profilePicture)
  return (
    <>
      <header>
        <Link href="/">
          <Image
            src={logo}
            alt="Carlos Marquina"
            loading="eager"
            className="w-10"
          />
        </Link>
        <div
          className="flex justify-between overflow-clip"
        >
          <h1
            className="font-bold text-2xl"
          >
            Carlos Marquina
          </h1>
          <div className="size-90 overflow-cli">
            <Image
              src={profilePicture}
              alt="Carlos Marquina"
              loading="eager"
              className="clip-circle size-90 object-cover object-[center_40%]"
              // className="w-full h-full object-cover"
              // className="size-90 clip-circle object-cover object-[center_40%]"
              // className="border-2 border-amber-300 object-[center_90%]"
              // className="border-2 border-amber-300 rounded-full object-cover object-[center_40%]"
            />
          </div>
        </div>


      </header>
    </>
  );
}