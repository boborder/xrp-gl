"use client"

import Link from "next/link";
import { Imag } from "./Imag";
import { Search } from "./Search";
import { Theme } from "./Theme";
import { Auth } from "./Auth";

export const Header = () => {
  return (
			<header>
				<div className="navbar-start">
					<label
						htmlFor="side-drawer"
						aria-label="open sidebar"
						className="hidden sm:block lg:hidden"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="inline-block h-12 w-12 stroke-current btn-ghost btn-square"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
							<title>hamburger</title>
						</svg>
					</label>

					<Link
						className="btn btn-ghost flex gap-0.5 px-1 hover:text-primary"
						href="/"
					>
					<Imag src={'/ipfs/logo.png'} width={44} height={44} alt="logo" />
					<h1 className="font-bold text-4xl">XRPGL</h1>
					</Link>
				</div>

				<div className="navbar-center hidden md:block lg:hidden xl:block">
					<Search />
				</div>

				<div className="navbar-end">
					<Theme />
					<Auth />
				</div>
			</header>
		);
};
