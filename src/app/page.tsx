"use client";

import MessageCarousel from "@/components/MessageCarousel";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && session.user) {
      router.push("/dashboard");
      return;
    }
  }, [session, router]);

  return (
    <>
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8 md:px-24 lg:py-16 xl:py-24">
        <section className="text-center mb-4 md:mb-12">
          <h1
            className="text-xl md:text-5xl font-bold lg:text-3xl
          xl:text-4xl"
          >
            Dive into the world of Anonymous Conversations with Stealthy Note 🕵️‍♂️
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            Explore Stealthy Note - Where your identity always remains a secret.
          </p>
        </section>
        <MessageCarousel />
      </main>
      <footer className="text-center p-2 md:p-2">
        © {new Date().getFullYear()} Stealthy Note. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
