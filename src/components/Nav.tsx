import Link from "next/link";
// import { usePathname } from "next/navigation";

export function Nav() {
//   const pathname = usePathname();
  return (
    <nav className="m-4 flex justify-center text-secondary text-lg">
      <Link href="/" className="aria-[current=page]:text-primary">
        Home
      </Link>
      <div className="divider divider-horizontal mx-2" />
      <Link href="/profile/profile" className="aria-[current=page]:text-primary">
        Profile
      </Link>
      <div className="divider divider-horizontal mx-2" />
      <Link href="/nft" className="aria-[current=page]:text-primary">
        NFT
      </Link>
      <div className="divider divider-horizontal mx-2" />
      <Link href="/test" className="aria-[current=page]:text-primary">
        Test
      </Link>
    </nav>
  )
}
